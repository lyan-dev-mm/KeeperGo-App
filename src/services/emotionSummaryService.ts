import { db, auth } from '../infrastructure/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export interface PendingSummaryInfo {
  hasPendingSummary: boolean;
  previousDate: string | null;
}

class EmotionSummaryService {
  /**
   * Obtiene la fecha local anterior en formato YYYY-MM-DD basándose en una fecha dada.
   */
  getPreviousDate(date: Date): string {
    const previous = new Date(date);
    previous.setDate(date.getDate() - 1);

    const year = previous.getFullYear();
    const month = String(previous.getMonth() + 1).padStart(2, '0');
    const day = String(previous.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Verifica si el día anterior calendario tiene un log emocional sin resumen diario.
   * Únicamente realiza la detección para preparación futura.
   */
  async checkPendingSummary(): Promise<PendingSummaryInfo> {
    const currentUser = auth.currentUser;
    if (!currentUser) return { hasPendingSummary: false, previousDate: null };

    const now = new Date();
    const previousDateStr = this.getPreviousDate(now);
    const uid = currentUser.uid;

    try {
      const logRef = doc(db, 'users', uid, 'emotion_logs', previousDateStr);
      const logSnap = await getDoc(logRef);

      if (logSnap.exists()) {
        const data = logSnap.data();
        // Se considera pendiente si el documento existe pero no tiene el campo 'daily_summary'
        const hasSummary = !!data.daily_summary;

        return {
          hasPendingSummary: !hasSummary,
          previousDate: previousDateStr
        };
      }

      return { hasPendingSummary: false, previousDate: previousDateStr };
    } catch (error) {
      console.error('Error al detectar resumen pendiente del día anterior:', error);
      // En caso de error, devolvemos false para no interrumpir el flujo principal
      return { hasPendingSummary: false, previousDate: previousDateStr };
    }
  }
}

export const emotionSummaryService = new EmotionSummaryService();
