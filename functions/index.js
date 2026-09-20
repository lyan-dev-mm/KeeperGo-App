const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Integración con Hume AI (Fase 2).
 * Analiza el sentimiento de un texto de forma sincrónica y guarda el resultado emocional.
 */
exports.analyzeEmotion = functions.https.onCall(async (data, context) => {
  // 1. Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debe estar autenticado.');
  }

  const { text } = data;
  if (!text || typeof text !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Se requiere un texto válido.');
  }

  // 2. Obtener credenciales de forma segura
  const humeApiKey = process.env.HUME_API_KEY;
  if (!humeApiKey) {
    console.error('HUME_API_KEY no configurada en el servidor.');
    throw new functions.https.HttpsError('internal', 'Error de configuración del servidor.');
  }

  try {
    // 3. Llamada sincrónica a Hume AI Language API
    const response = await fetch('https://api.hume.ai/v0/language/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hume-Api-Key': humeApiKey,
      },
      body: JSON.stringify({
        text: [text],
        models: {
          language: { granularity: 'sentence' },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Sanitizar error para no exponer llaves ni texto en logs
      console.error('Error de Hume AI API (Status:', response.status, ')');
      throw new Error('Error en el servicio de análisis emocional.');
    }

    const result = await response.json();

    // 4. Procesar emociones (Top 5 y Dominante)
    // Estructura esperada: result[0].predictions[0].models.language.grouped_predictions[0].predictions[0].emotions
    let emotions = [];
    try {
      const languagePredictions = result[0]?.predictions?.[0]?.models?.language?.grouped_predictions?.[0]?.predictions?.[0]?.emotions;
      if (Array.isArray(languagePredictions)) {
        emotions = languagePredictions
          .map(e => ({ name: e.name, score: e.score }))
          .sort((a, b) => b.score - a.score);
      }
    } catch (parseError) {
      console.error('Error al procesar el formato de respuesta de Hume.');
    }

    const topEmotions = emotions.slice(0, 5);
    const dominantEmotion = topEmotions.length > 0 ? topEmotions[0].name : 'unknown';

    // 5. Guardar en Firestore (Estructura estricta de 4 campos)
    const uid = context.auth.uid;
    const logRef = admin.firestore().collection('users').doc(uid).collection('emotion_logs').doc();

    const logEntry = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      top_emotions: topEmotions,
      dominant_emotion: dominantEmotion,
      status: emotions.length > 0 ? 'success' : 'error'
    };

    await logRef.set(logEntry);

    // 6. Retornar solo lo necesario al cliente
    return {
      success: true,
      dominant_emotion: dominantEmotion,
      top_emotions: topEmotions
    };

  } catch (error) {
    // Sanitizar log de error: no imprimir 'text' ni 'humeApiKey'
    console.error('Error en analyzeEmotion (Backend):', error.message);
    throw new functions.https.HttpsError('internal', 'No se pudo procesar el análisis emocional.');
  }
});

/**
 * Placeholder para la integración con OpenAI (Fase 3).
 * Esta función manejará la conversación de forma segura en el backend.
 */
exports.chatWithAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debe estar autenticado.');
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    console.error('Credencial de OpenAI no configurada.');
    throw new functions.https.HttpsError('internal', 'Error de configuración del servidor.');
  }

  // TODO: Implementar lógica de OpenAI en la Fase 3
  return { message: 'Servicio de OpenAI preparado.' };
});
