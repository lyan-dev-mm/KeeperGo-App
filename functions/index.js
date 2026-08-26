const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

/**
 * Verifica si una persona tiene cédula profesional registrada mediante su CURP usando Kiban API.
 */
exports.verifyProfessionalLicense = functions.https.onCall(async (data, context) => {
  // 1. Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'El usuario debe estar autenticado para realizar esta acción.'
    );
  }

  const { curp } = data;

  // 2. Validar CURP (básico)
  if (!curp || curp.length !== 18) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Se requiere una CURP válida de 18 caracteres.'
    );
  }

  const kibanApiKey = process.env.KIBAN_API_KEY; // Se debe configurar en Firebase Env
  if (!kibanApiKey) {
    console.error('KIBAN_API_KEY no configurada en el servidor.');
    throw new functions.https.HttpsError(
      'internal',
      'Error de configuración del servidor.'
    );
  }

  try {
    // 3. Llamada a Kiban API
    const response = await fetch('https://api.link.kiban.com/api/v2/sep_cedula/validate_by_curp', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kibanApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ curp: curp.toUpperCase() }),
    });

    const result = await response.json();

    // 4. Determinar si se encontró la cédula
    // Basado en investigación: FOUND o si el array de resultados no está vacío
    let isVerified = false;
    if (response.ok && result) {
      // Kiban puede devolver un objeto con status o un array directamente
      if (result.status === 'FOUND') {
        isVerified = true;
      } else if (Array.isArray(result) && result.length > 0) {
        isVerified = true;
      } else if (result.response && result.response.status === 'FOUND') {
        isVerified = true;
      }
    }

    // 5. Actualizar Firestore
    const uid = context.auth.uid;
    const userRef = admin.firestore().collection('users').doc(uid);

    const updateData = {
      professionalVerified: isVerified,
      professionalVerificationDate: admin.firestore.FieldValue.serverTimestamp(),
      curp: curp.toUpperCase(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userRef.set(updateData, { merge: true });

    return { success: true, verified: isVerified };
  } catch (error) {
    console.error('Error al verificar cédula en Kiban:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Ocurrió un error al comunicarse con el servicio de verificación.'
    );
  }
});
