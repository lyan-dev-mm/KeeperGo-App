const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Placeholder para la integración con OpenAI (Fase 3).
 * Esta función manejará la conversación de forma segura en el backend.
 */
exports.chatWithAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debe estar autenticado.');
  }

  const openaiApiKey = process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_BETA_OPENAI_API_KEY;

  if (!openaiApiKey) {
    console.error('Credencial de OpenAI no configurada.');
    throw new functions.https.HttpsError('internal', 'Error de configuración del servidor.');
  }

  // TODO: Implementar lógica de OpenAI en la Fase 3
  return { message: 'Servicio de OpenAI preparado.' };
});
