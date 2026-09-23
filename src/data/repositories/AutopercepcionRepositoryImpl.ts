// src/data/repositories/AutopercepcionRepositoryImpl.ts

import { db } from '../../infrastructure/firebase/firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import {
  AutopercepcionResponse,
  AutopercepcionTipo,
} from '../../domain/entities/autopercepcion/AutopercepcionResponse';
import { IAutopercepcionRepository } from '../../domain/interfaces/IAutopercepcionRepository';

export class AutopercepcionRepositoryImpl implements IAutopercepcionRepository {
  private getUserCollection(userId: string) {
    return collection(db, 'users', userId, 'autopercepcion');
  }

  private getDocRef(userId: string, responseId: string) {
    return doc(db, 'users', userId, 'autopercepcion', responseId);
  }

  async saveResponse(
    response: AutopercepcionResponse
  ): Promise<AutopercepcionResponse> {
    try {
      const docRef = this.getDocRef(response.userId, response.id);
      await setDoc(docRef, response.toJSON());
      console.log(
        '[Autopercepcion] Guardado:',
        response.id,
        'tipo:',
        response.tipo,
        'indiceProductividad:',
        response.indiceProductividad.toFixed(2)
      );
      return response;
    } catch (error) {
      console.error('[Autopercepcion] Error guardando:', error);
      throw error;
    }
  }

  async getResponses(userId: string): Promise<AutopercepcionResponse[]> {
    try {
      const snapshot = await getDocs(this.getUserCollection(userId));
      const responses = snapshot.docs.map((d) =>
        AutopercepcionResponse.fromJSON(d.data())
      );
      return responses.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    } catch (error) {
      console.error('[Autopercepcion] Error obteniendo respuestas:', error);
      return [];
    }
  }

  async getResponseByTipo(
    userId: string,
    tipo: AutopercepcionTipo
  ): Promise<AutopercepcionResponse | null> {
    try {
      // ID determinístico: un documento por (userId, tipo).
      const docRef = this.getDocRef(userId, `autopercepcion_${userId}_${tipo}`);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return AutopercepcionResponse.fromJSON(snap.data());
    } catch (error) {
      console.error('[Autopercepcion] Error obteniendo por tipo:', error);
      return null;
    }
  }

  async hasCompletedPretest(userId: string): Promise<boolean> {
    const r = await this.getResponseByTipo(userId, 'pretest');
    return !!r?.completado;
  }

  async hasCompletedPostest(userId: string): Promise<boolean> {
    const r = await this.getResponseByTipo(userId, 'postest');
    return !!r?.completado;
  }
}