import { db } from '../infrastructure/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

export interface DailySummaryData {
  text: string;
  generatedAt: string;
}

class DailySummaryService {
  /**
   * Genera y guarda un resumen diario enriquecido utilizando chat_history y emotion_logs.
   */
  async generateAndSaveSummary(uid: string, date: string): Promise<void> {
    try {
      // 1. Verificar si el resumen ya existe (Idempotencia)
      const logRef = doc(db, 'users', uid, 'emotion_logs', date);
      const logSnap = await getDoc(logRef);

      if (!logSnap.exists()) {
        console.log(`[DailySummary] No existe emotion_log para ${date}.`);
        return;
      }

      const logData = logSnap.data();
      if (logData.daily_summary) {
        console.log(`[DailySummary] Resumen ya existe para ${date}.`);
        return;
      }

      // 2. Obtener fuentes de datos (Emociones + Chat)
      const historyRef = doc(db, 'users', uid, 'chat_history', date);
      const historySnap = await getDoc(historyRef);

      const chatHistory = historySnap.exists() ? historySnap.data().messages || [] : [];

      const emotionalData = {
        morning: logData.morning?.interactions?.map((i: any) => ({ dominant: i.dominant_emotion, top: i.top_emotions })) || [],
        afternoon: logData.afternoon?.interactions?.map((i: any) => ({ dominant: i.dominant_emotion, top: i.top_emotions })) || [],
        evening: logData.evening?.interactions?.map((i: any) => ({ dominant: i.dominant_emotion, top: i.top_emotions })) || []
      };

      // 3. Validar existencia de datos mínimos
      const hasEmotions = emotionalData.morning.length > 0 || emotionalData.afternoon.length > 0 || emotionalData.evening.length > 0;
      const hasChat = chatHistory.length > 0;

      if (!hasEmotions && !hasChat) {
        console.log(`[DailySummary] Sin datos suficientes para resumir el día ${date}.`);
        return;
      }

      // 4. Solicitar resumen enriquecido a OpenAI
      const summaryText = await this.requestOpenAISummary(emotionalData, chatHistory);

      if (summaryText) {
        // 5. Persistencia en el documento de logs
        await updateDoc(logRef, {
          daily_summary: {
            text: summaryText,
            generatedAt: new Date().toISOString()
          }
        });
        console.log(`[DailySummary] Resumen enriquecido guardado para ${date}.`);
      }

    } catch (error) {
      console.error(`[DailySummary] Error crítico procesando resumen para ${date}:`, error);
    }
  }

  /**
   * Realiza la limpieza de historiales de chat que superan la ventana de 7 días.
   * La eliminación es independiente del estado de daily_summary.
   */
  async cleanupExpiredChatHistory(uid: string): Promise<void> {
    try {
      const now = new Date();
      // Calcular la fecha límite (exactamente hace 7 días a las 00:00:00 local)
      // Ejemplo: si hoy es 20 sep, limitDate será 13 sep 00:00:00
      const limitDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

      const historyCollectionRef = collection(db, 'users', uid, 'chat_history');
      const snapshot = await getDocs(historyCollectionRef);

      const deletePromises: Promise<void>[] = [];

      snapshot.forEach((docSnap) => {
        const dateStr = docSnap.id; // ID esperado: YYYY-MM-DD
        // Intentar parsear el ID del documento como fecha
        const [year, month, day] = dateStr.split('-').map(Number);
        const docDate = new Date(year, month - 1, day);

        // Si la fecha del documento es anterior al límite, se marca para eliminación
        if (!isNaN(docDate.getTime()) && docDate < limitDate) {
          console.log(`[Cleanup] Documento fuera de ventana (7 días): ${dateStr}`);
          deletePromises.push(deleteDoc(docSnap.ref));
        }
      });

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log(`[Cleanup] Se eliminaron ${deletePromises.length} historiales antiguos.`);
      }

    } catch (error) {
      console.error('[Cleanup] Error al limpiar historiales antiguos:', error);
    }
  }

  /**
   * Comunicación con OpenAI para generar un resumen basado en métricas y contenido del chat.
   */
  private async requestOpenAISummary(emotions: any, chat: any[]): Promise<string | null> {
    const openaiApiKey = process.env.EXPO_PUBLIC_BETA_OPENAI_API_KEY;
    if (!openaiApiKey) return null;

    const systemPrompt = `Eres un analizador de bienestar emocional para KeeperGo.
Tu tarea es generar un resumen diario breve, natural y empático que combine la evolución emocional y el contexto de las conversaciones del usuario.

REGLAS DE PRIVACIDAD Y SEGURIDAD:
- NO incluyas nombres, correos, teléfonos, CURP, direcciones ni datos de identificación.
- NO reproduzcas mensajes literales del usuario.
- NO realices diagnósticos médicos ni psicológicos.
- NO afirmes causalidad clínica (ej: "te sientes así por X"). Describe patrones o temas generales observados.
- Mantén un lenguaje neutral, cálido y de acompañamiento conversacional.
- El resultado debe ser EXCLUSIVAMENTE el texto del resumen, máximo 4-5 oraciones.

CONTENIDO DEL RESUMEN:
1. Evolución emocional: Describe tendencias predominantes y cambios entre periodos (mañana, tarde, noche).
2. Temas generales: Menciona los temas o situaciones generales tratados en el chat de forma anónima y generalizada.`;

    const simplifiedChat = chat.map(m => `[${m.role}]: ${m.content}`);

    const userPrompt = `FUENTES DE DATOS DEL DÍA:

MÉTRICAS EMOCIONALES:
${JSON.stringify(emotions, null, 2)}

CONTENIDO DEL CHAT (CONTEXTO):
${simplifiedChat.join('\n')}

Por favor, genera el resumen diario enriquecido:`;

    try {
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
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI API Status: ${response.status}`);

      const result = await response.json();
      return result.choices?.[0]?.message?.content?.trim() || null;

    } catch (error) {
      console.error('[DailySummary] Error en llamada a OpenAI:', error);
      return null;
    }
  }
}

export const dailySummaryService = new DailySummaryService();
