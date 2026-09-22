// src/data/repositories/SUSRepositoryImpl.ts

import { db } from '../../infrastructure/firebase/firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { SUSResponse } from '../../domain/entities/sus/SUSResponse';
import { ISUSRepository } from '../../domain/interfaces/ISUSRepository';

export class SUSRepositoryImpl implements ISUSRepository {
  private getDocRef(userId: string, responseId: string) {
    return doc(db, 'users', userId, 'sus', responseId);
  }

  async saveResponse(response: SUSResponse): Promise<SUSResponse> {
    try {
      const docRef = this.getDocRef(response.userId, response.id);
      await setDoc(docRef, response.toJSON());
      console.log('[SUS] Guardado:', response.id, 'puntuación:', response.puntuacion);
      return response;
    } catch (error) {
      console.error('[SUS] Error guardando:', error);
      throw error;
    }
  }

  async getResponse(userId: string): Promise<SUSResponse | null> {
    try {
      // ID determinístico: sus_{userId}
      const docRef = this.getDocRef(userId, `sus_${userId}`);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return SUSResponse.fromJSON(snap.data());
    } catch (error) {
      console.error('[SUS] Error obteniendo:', error);
      return null;
    }
  }

  async hasCompleted(userId: string): Promise<boolean> {
    const r = await this.getResponse(userId);
    return !!r?.completado;
  }
}