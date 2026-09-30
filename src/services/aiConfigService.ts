import { db, auth } from '../infrastructure/firebase/firebaseConfig';
import { doc, setDoc, getDoc, arrayUnion, runTransaction, serverTimestamp } from 'firebase/firestore';
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
  limitReached?: boolean;
  isPremium?: boolean;
  linkLabel?: string;
}

/**
 * CONFIGURACIÓN TEMPORAL PARA LA BETA CERRADA DE 5 DÍAS.
 *
 * Este servicio centraliza la comunicación con OpenAI mediante llamadas directas
 * desde el cliente (APK) utilizando variables de entorno de Expo.
 */
class AIConfigService {

  /**
   * Obtiene la clave del mes actual en formato YYYY-MM utilizando la fecha local del dispositivo.
   */
  get currentMonthKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

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
   * Verifica y reserva 1 unidad de cuota mensual para el usuario en Firestore de forma atómica.
   * Path: userProfiles/{uid}/usage/{YYYY-MM}
   */
  /**
   * Genera un identificador único para la reserva.
   */
  private generateReservationId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Verifica y reserva 1 unidad de cuota mensual para el usuario en Firestore de forma atómica.
   * Crea una reserva pendiente con identificador único que expira en 2 minutos.
   * Path: userProfiles/{uid}/usage/{YYYY-MM}
   */
  async checkAndReserveQuota(uid: string): Promise<{
    allowed: boolean;
    reservationId?: string;
    isPremium: boolean;
    limit: number;
    currentCount: number;
    monthKey: string;
  }> {
    const monthKey = this.currentMonthKey;
    const userProfileRef = doc(db, 'userProfiles', uid);
    const usageRef = doc(db, 'userProfiles', uid, 'usage', monthKey);

    return await runTransaction(db, async (transaction) => {
      const profileSnap = await transaction.get(userProfileRef);
      const usageSnap = await transaction.get(usageRef);

      const isPremium = profileSnap.exists() ? profileSnap.data()?.premium === true : false;

      let bonusMessages = 0;
      let monthPremium = isPremium;

      const usageData = usageSnap.exists() ? usageSnap.data() : null;
      const currentCount = usageData?.messageCount || 0;

      if (!isPremium) {
        // Usuario Básico
        // Si el histórico mensual ya tenía premium: true, preservarlo (Regla 6)
        if (usageData?.premium) {
          monthPremium = true;
        }
      } else {
        // Usuario Premium
        monthPremium = true;
        // Evaluar regla de beneficio de transición (Regla 15 y 16):
        // Si usage previo ya tenía bonusMessages: 20, mantenerlo
        if (usageData?.bonusMessages === 20) {
          bonusMessages = 20;
        } else if (usageData && usageData.premium === false) {
          // El usuario usó Kii este mes como Básico y activó Premium durante el mismo mes
          bonusMessages = 20;
        }
      }

      // Límites: Básico = 20, Premium = 80 (+ 20 si aplica beneficio de transición = 100)
      const baseLimit = isPremium ? 80 : 20;
      const effectiveLimit = baseLimit + bonusMessages;

      // Limpiar reservas expiradas (> 2 minutos)
      const nowMs = Date.now();
      const EXPIRATION_MS = 2 * 60 * 1000;
      const pendingReservations: Record<string, { createdAt: number }> = usageData?.pendingReservations || {};
      const activePending: Record<string, { createdAt: number }> = {};
      let activePendingCount = 0;

      for (const [resId, resData] of Object.entries(pendingReservations)) {
        if (resData && typeof resData.createdAt === 'number') {
          if (nowMs - resData.createdAt < EXPIRATION_MS) {
            activePending[resId] = resData;
            activePendingCount++;
          }
        }
      }

      // Consumo actual = mensajes confirmados + reservas pendientes activas
      const currentConsumption = currentCount + activePendingCount;

      if (currentConsumption >= effectiveLimit) {
        // Si se limpiaron reservas expiradas, persistir el mapa limpio
        if (Object.keys(activePending).length !== Object.keys(pendingReservations).length) {
          transaction.set(usageRef, { pendingReservations: activePending }, { merge: true });
        }
        return {
          allowed: false,
          isPremium,
          limit: effectiveLimit,
          currentCount: currentConsumption,
          monthKey
        };
      }

      // Generar nuevo reservationId único y registrar reserva pendiente
      const reservationId = this.generateReservationId();
      activePending[reservationId] = { createdAt: nowMs };

      const updateData: any = {
        month: monthKey,
        messageCount: currentCount, // NO incrementar messageCount
        pendingReservations: activePending,
        premium: monthPremium,
        lastUpdated: serverTimestamp()
      };
      if (bonusMessages > 0) {
        updateData.bonusMessages = bonusMessages;
      }

      transaction.set(usageRef, updateData, { merge: true });

      return {
        allowed: true,
        reservationId,
        isPremium,
        limit: effectiveLimit,
        currentCount: currentConsumption + 1,
        monthKey
      };
    });
  }

  /**
   * Confirma la reserva de cuota convirtiéndola en consumo real (messageCount + 1).
   * Elimina la reserva de pendingReservations. Si la reserva no existe, es un no-op idempotente.
   */
  async confirmQuotaReservation(uid: string, monthKey: string, reservationId: string): Promise<boolean> {
    if (!reservationId) return false;
    try {
      const usageRef = doc(db, 'userProfiles', uid, 'usage', monthKey);
      return await runTransaction(db, async (transaction) => {
        const usageSnap = await transaction.get(usageRef);
        if (!usageSnap.exists()) return false;

        const usageData = usageSnap.data();
        const pendingReservations: Record<string, { createdAt: number }> = usageData?.pendingReservations || {};

        if (!(reservationId in pendingReservations)) {
          // La reserva no existe o ya fue confirmada/liberada/expirada. No duplicar consumo.
          return false;
        }

        // Eliminar reserva de pendingReservations e incrementar messageCount en +1
        const remainingPending = { ...pendingReservations };
        delete remainingPending[reservationId];

        const currentCount = usageData?.messageCount || 0;
        const newCount = currentCount + 1;

        transaction.update(usageRef, {
          messageCount: newCount,
          pendingReservations: remainingPending,
          lastUpdated: serverTimestamp()
        });

        return true;
      });
    } catch (err) {
      console.error('[AIConfig] Error al confirmar reserva de cuota:', err);
      return false;
    }
  }

  /**
   * Libera una reserva pendiente eliminándola de pendingReservations sin modificar messageCount.
   * Si la reserva no existe o ya fue liberada/confirmada, es un no-op idempotente.
   */
  async releaseQuotaReservation(uid: string, monthKey: string, reservationId: string): Promise<boolean> {
    if (!reservationId) return false;
    try {
      const usageRef = doc(db, 'userProfiles', uid, 'usage', monthKey);
      return await runTransaction(db, async (transaction) => {
        const usageSnap = await transaction.get(usageRef);
        if (!usageSnap.exists()) return false;

        const usageData = usageSnap.data();
        const pendingReservations: Record<string, { createdAt: number }> = usageData?.pendingReservations || {};

        if (!(reservationId in pendingReservations)) {
          // La reserva no existe o ya fue liberada/confirmada. No-op.
          return false;
        }

        // Eliminar la reserva de pendingReservations sin modificar messageCount
        const remainingPending = { ...pendingReservations };
        delete remainingPending[reservationId];

        transaction.update(usageRef, {
          pendingReservations: remainingPending,
          lastUpdated: serverTimestamp()
        });

        return true;
      });
    } catch (err) {
      console.error('[AIConfig] Error al liberar reserva de cuota:', err);
      return false;
    }
  }

  /**
   * OPERACIÓN CONVERSACIONAL ÚNICA (ARQUITECTURA UNIFICADA OPENAI CON CONTROL DE CUOTA)
   * Coordina la comprobación de cuota, la respuesta de Kii y el análisis emocional.
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

    const currentUser = auth.currentUser;
    let reservation: {
      allowed: boolean;
      reservationId?: string;
      isPremium: boolean;
      limit: number;
      currentCount: number;
      monthKey: string;
    } | null = null;

    let hasProcessedQuota = false;

    // 0. Comprobar y reservar cuota mensual ANTES de llamar a OpenAI
    if (currentUser?.uid) {
      try {
        reservation = await this.checkAndReserveQuota(currentUser.uid);

        if (!reservation.allowed) {
          const reply = reservation.isPremium
            ? 'Parece que te ha gustado hablar con Kii, y somos conscientes de ello. Es por eso que estamos preparando futuros planes para mejorar tu experiencia y facilitar aún más el acceso a nuestras funciones.'
            : 'Hemos llegado al límite de nuestra conversación. Si te encanta esta función, puedes aumentar el límite del chat suscribiéndote a la versión Premium.';

          return {
            success: false,
            reply,
            limitReached: true,
            isPremium: reservation.isPremium,
            linkLabel: reservation.isPremium ? undefined : 'Ver versión Premium'
          };
        }
      } catch (quotaErr: any) {
        console.error('[AIConfig] Error al verificar cuota mensual:', quotaErr);
        return {
          success: false,
          reply: 'Lo siento, ocurrió un error al verificar tu cuota de mensajes. Por favor intenta de nuevo.',
          error: quotaErr.message
        };
      }
    }

    try {
      // 1. Obtener memoria contextual de resúmenes anteriores (Día -1 y Día -2)
      let memoryPromptSection = '';

      if (currentUser?.uid) {
        try {
          const nowDate = new Date();
          const dayMinus1Date = emotionSummaryService.getPreviousDate(nowDate);
          const dateMinus1Obj = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() - 1);
          const dayMinus2Date = emotionSummaryService.getPreviousDate(dateMinus1Obj);

          const [summaryDayMinus1, summaryDayMinus2] = await Promise.all([
            dailySummaryService.getDailySummary(currentUser.uid, dayMinus1Date),
            dailySummaryService.getDailySummary(currentUser.uid, dayMinus2Date)
          ]).catch(err => {
            console.error('[AIConfig] Error consultando resúmenes de días anteriores:', err);
            return [null, null];
          });

          const memoryBlocks: string[] = [];

          if (summaryDayMinus1?.text) {
            memoryBlocks.push(`[Resumen del día anterior (${dayMinus1Date})]:\n${summaryDayMinus1.text}`);
          }

          if (summaryDayMinus2?.text) {
            memoryBlocks.push(`[Resumen de hace dos días (${dayMinus2Date})]:\n${summaryDayMinus2.text}`);
          }

          if (memoryBlocks.length > 0) {
            memoryPromptSection = `\n\nMEMORIA CONTEXTUAL DE DÍAS ANTERIORES:
Los siguientes resúmenes corresponden a conversaciones y análisis emocionales de días anteriores. Úsalos únicamente como contexto para comprender la continuidad de la conversación actual. No los presentes como hechos actuales si no corresponden al presente.

${memoryBlocks.join('\n\n')}`;
          }
        } catch (memErr) {
          console.error('[AIConfig] Error al procesar memoria contextual:', memErr);
          memoryPromptSection = '';
        }
      }

      // 2. Construir System Prompt con reglas críticas, memoria contextual y formato JSON estricto
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
Usa emociones estándar (ej: joy, sadness, anger, fear, stress, neutral). Los scores deben ser números entre 0 y 1.${memoryPromptSection}`;

      // 3. Llamada unificada a OpenAI (gpt-4o-mini) con JSON Mode
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

      // 4. Parseo y validación del JSON generado por el modelo
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
        .sort((a: { score: number }, b: { score: number }) => b.score - a.score);

      if (top_emotions.length > 0) {
        dominant_emotion = top_emotions[0].name;
      }

      const emotionalData = {
        dominant_emotion,
        top_emotions
      };

      // 5. Persistencia en Firestore (Estructura Diaria por Periodos)
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

          // Hora local del dispositivo (0-23)
          const hour = now.getHours();

          // Determinar periodo del día
          let period: 'morning' | 'afternoon' | 'evening';
          if (hour >= 6 && hour < 12) {
            period = 'morning';
          } else if (hour >= 12 && hour < 19) {
            period = 'afternoon';
          } else {
            period = 'evening';
          }

          const logRef = doc(db, 'users', uid, 'emotion_logs', dateId);
          const historyRef = doc(db, 'users', uid, 'chat_history', dateId);

          const interaction = {
            timeHost: now.toISOString(),
            top_emotions,
            dominant_emotion
          };

          await setDoc(logRef, {
            date: dateId,
            [period]: {
              interactions: arrayUnion(interaction)
            }
          }, { merge: true });

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

      // 6. Confirmar reserva de cuota en Firestore tras respuesta exitosa de OpenAI
      if (currentUser?.uid && reservation?.allowed && reservation?.reservationId && !hasProcessedQuota) {
        hasProcessedQuota = true;
        await this.confirmQuotaReservation(currentUser.uid, reservation.monthKey, reservation.reservationId);
      }

      return {
        success: true,
        reply: reply,
        emotionalData: emotionalData
      };

    } catch (error: any) {
      console.error('Error en chatWithAI (Unified Flow):', error.message);

      // Si se realizó una reserva y ocurrió un error, LIBERAR LA RESERVA por reservationId
      if (currentUser?.uid && reservation?.allowed && reservation?.reservationId && !hasProcessedQuota) {
        hasProcessedQuota = true;
        await this.releaseQuotaReservation(currentUser.uid, reservation.monthKey, reservation.reservationId);
      }

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
