import { db, auth } from '../infrastructure/firebase/firebaseConfig';
import { doc, setDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { emotionSummaryService } from './emotionSummaryService';
import { dailySummaryService } from './dailySummaryService';

/**
 * CONTRATO DE HISTORIAL Y RESPUESTA PARA LA BETA
 */
export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  success: boolean;
  reply: string;
  emotionalData?: {
    dominant_emotion: string;
    top_emotions: Array<{
      name: string;
      score: number;
    }>;
  };
  error?: string;
}

/**
 * CONFIGURACIÓN TEMPORAL PARA LA BETA CERRADA DE 5 DÍAS.
 *
 * Este servicio centraliza la comunicación con OpenAI mediante llamadas directas
 * desde el cliente (APK) utilizando variables de entorno de Expo.
 */
class AIConfigService {

  /**
   * Obtiene el historial de mensajes del día actual para el usuario.
   * Utiliza la fecha local del dispositivo.
   */
  async getCurrentDayHistory(uid: string): Promise<ChatHistoryMessage[]> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateId = `${year}-${month}-${day}`;

    try {
      const historyRef = doc(db, 'users', uid, 'chat_history', dateId);
      const snap = await getDoc(historyRef);

      if (snap.exists()) {
        const data = snap.data();
        return data.messages || [];
      }
      return [];
    } catch (error) {
      console.error('[Error] Falló la precarga del historial:', error);
      throw error;
    }
  }

  /**
   * OPERACIÓN CONVERSACIONAL ÚNICA (ARQUITECTURA UNIFICADA OPENAI)
   * Coordina la respuesta de Kii y el análisis emocional en una sola llamada a OpenAI.
   */
  async chatWithAI(params: { text: string; history: ChatHistoryMessage[] }): Promise<AIResponse> {
    const { text, history } = params;
    const openaiApiKey = process.env.EXPO_PUBLIC_BETA_OPENAI_API_KEY;

    if (!openaiApiKey) {
      return {
        success: false,
        reply: 'Error de configuración en el servicio de chat.',
        error: 'MISSING_OPENAI_KEY'
      };
    }

    try {
      // 1. Construir System Prompt con reglas críticas y solicitud de formato JSON estricto
      const systemPrompt = `Eres Kii, una asistente de escucha y acompañamiento empático de primer contacto para KeeperGo.
Tu función es escuchar, responder empáticamente y proporcionar acompañamiento conversacional.

REGLAS CRÍTICAS:
* NO realices diagnósticos médicos ni psicológicos.
* NO afirmes que el usuario tiene una enfermedad, trastorno o condición clínica (ej: "tienes depresión").
* NO presentes tus respuestas como sustituto de un profesional de la salud.
* NO realices autodiagnósticos ni incentives al usuario a hacerlo.
* Si detectas riesgo o crisis, orienta calmadamente hacia los especialistas de KeeperGo.

ANÁLISIS EMOCIONAL:
Analiza el sentimiento del mensaje actual del usuario como contexto interno. No menciones scores técnicos al usuario.

DEBES RESPONDER EXCLUSIVAMENTE EN FORMATO JSON CON ESTA ESTRUCTURA:
{
  "reply": "Tu respuesta empática y natural aquí",
  "dominant_emotion": "nombre_emocion_principal",
  "top_emotions": [
    {"name": "emocion1", "score": 0.XX},
    {"name": "emocion2", "score": 0.XX}
  ]
}
Usa emociones estándar (ej: joy, sadness, anger, fear, stress, neutral). Los scores deben ser números entre 0 y 1.`;

      // 2. Llamada unificada a OpenAI (gpt-4o-mini) con JSON Mode
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: text }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      // Manejo de errores de API
      if (!response.ok) {
        let openAIErrorMsg = 'Unknown OpenAI error';
        try {
          const errBody = await response.json();
          if (errBody?.error) openAIErrorMsg = errBody.error.message;
        } catch (e) {}

        console.error('[OPENAI ERROR]', response.status, openAIErrorMsg);
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Respuesta vacía de OpenAI');
      }

      // 3. Parseo y validación del JSON generado por el modelo
      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (parseErr) {
        console.error('Error parseando JSON de OpenAI:', parseErr);
        throw new Error('Formato de respuesta inválido');
      }

      const reply = parsedData.reply || 'Estoy aquí para escucharte. Cuéntame más. ❤️';
      let dominant_emotion = parsedData.dominant_emotion || 'unknown';
      let top_emotions = Array.isArray(parsedData.top_emotions) ? parsedData.top_emotions : [];

      // Validar y normalizar scores y orden
      top_emotions = top_emotions
        .filter((e: any) => typeof e.name === 'string' && typeof e.score === 'number')
        .map((e: any) => ({ name: e.name, score: Math.min(1, Math.max(0, e.score)) }))
        .sort((a, b) => b.score - a.score);

      if (top_emotions.length > 0) {
        dominant_emotion = top_emotions[0].name;
      }

      const emotionalData = {
        dominant_emotion,
        top_emotions
      };

      // 4. Persistencia en Firestore (Estructura Diaria por Periodos)
      const currentUser = auth.currentUser;
      if (currentUser && top_emotions.length > 0) {
        try {
          const uid = currentUser.uid;
          const now = new Date();

          // Detección de cambio de día (Preparación para daily_summary)
          emotionSummaryService.checkPendingSummary().then(info => {
            if (info.hasPendingSummary && info.previousDate) {
              console.log(`[INFO] Día anterior detectado pendiente de resumen: ${info.previousDate}`);
              // Iniciar generación de resumen de forma asíncrona (Segundo plano)
              dailySummaryService.generateAndSaveSummary(uid, info.previousDate)
                .catch(err => console.error('Error al generar resumen diario:', err));
            }
          }).catch(err => console.error('Error silencioso en detección de resumen:', err));

          // Obtener fecha local YYYY-MM-DD
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const dateId = `${year}-${month}-${day}`;

          // Forzar la obtención de la hora local del dispositivo (0-23)
          // ignorando si el entorno JS está en UTC.
          const hour = parseInt(new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false
          }).format(now));

          // Determinar periodo del día (Basado estrictamente en hora local del dispositivo)
          let period: 'morning' | 'afternoon' | 'evening';
          if (hour >= 6 && hour < 12) {
            period = 'morning'; // 06:00 - 11:59
          } else if (hour >= 12 && hour < 19) {
            period = 'afternoon'; // 12:00 - 18:59
          } else {
            period = 'evening'; // 19:00 - 05:59
          }

          const logRef = doc(db, 'users', uid, 'emotion_logs', dateId);
          const historyRef = doc(db, 'users', uid, 'chat_history', dateId);

          const interaction = {
            timeHost: now.toISOString(),
            top_emotions,
            dominant_emotion
          };

          // Actualización atómica con arrayUnion y merge para inicializar si no existe
          await setDoc(logRef, {
            date: dateId,
            [period]: {
              interactions: arrayUnion(interaction)
            }
          }, { merge: true });

          // PERSISTENCIA TEMPORAL DEL CHAT (Fase 1 de Historial Diario)
          // Guardamos los mensajes del usuario y la respuesta de Kii en el historial del día
          const userMsgEntry = {
            role: 'user',
            content: text,
            timestamp: now.toISOString()
          };

          const assistantMsgEntry = {
            role: 'assistant',
            content: reply,
            timestamp: new Date().toISOString()
          };

          await setDoc(historyRef, {
            date: dateId,
            messages: arrayUnion(userMsgEntry, assistantMsgEntry)
          }, { merge: true }).catch(e => console.error('[Error] Falló guardado de historial temporal:', e));

        } catch (dbErr) {
          console.error('Error guardando logs emocionales agrupados:', dbErr);
        }
      }

      return {
        success: true,
        reply: reply,
        emotionalData: emotionalData
      };

    } catch (error: any) {
      console.error('Error en chatWithAI (Unified Flow):', error.message);

      // Clasificación de errores para respuestas empáticas del lado de Kii
      let fallbackReply = 'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías repetirme eso? Estoy aquí contigo. ❤️';

      // A. Error de conexión / Internet
      const isNetworkError =
        error.message?.toLowerCase().includes('network') ||
        error.message?.toLowerCase().includes('fetch') ||
        error.name === 'TypeError';

      if (isNetworkError) {
        fallbackReply = 'Lo siento mucho por querer hablar conmigo, pero detecté que no hay una conexión a internet estable. ¿Puedes verificar que tengas acceso para que podamos hablar?';
      }

      return {
        success: false,
        reply: fallbackReply,
        error: error.message
      };
    }
  }
}

export const aiConfigService = new AIConfigService();
