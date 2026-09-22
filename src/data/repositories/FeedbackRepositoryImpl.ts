// src/data/repositories/FeedbackRepositoryImpl.ts

import { db } from '../../infrastructure/firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FeedbackResponse } from '../../domain/entities/feedback/FeedbackResponse';
import { IFeedbackRepository } from '../../domain/interfaces/IFeedbackRepository';

export class FeedbackRepositoryImpl implements IFeedbackRepository {
  private getDocRef(userId: string, responseId: string) {
    return doc(db, 'users', userId, 'feedback', responseId);
  }

  async saveResponse(response: FeedbackResponse): Promise<FeedbackResponse> {
    try {
      const docRef = this.getDocRef(response.userId, response.id);
      await setDoc(docRef, response.toJSON());
      console.log(
        '[Feedback] Guardado:',
        response.id,
        'NPS:',
        response.nps,
        'categoría:',
        response.categoriaNPS
      );
      return response;
    } catch (error) {
      console.error('[Feedback] Error guardando:', error);
      throw error;
    }
  }

  async getResponse(userId: string): Promise<FeedbackResponse | null> {
    try {
      const docRef = this.getDocRef(userId, `feedback_${userId}`);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return FeedbackResponse.fromJSON(snap.data());
    } catch (error) {
      console.error('[Feedback] Error obteniendo:', error);
      return null;
    }
  }

  async hasCompleted(userId: string): Promise<boolean> {
    const r = await this.getResponse(userId);
    return !!r?.completado;
  }
}