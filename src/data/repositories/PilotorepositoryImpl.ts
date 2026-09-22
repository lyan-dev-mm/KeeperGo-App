// src/data/repositories/PilotoRepositoryImpl.ts

import { db } from '../../infrastructure/firebase/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { PilotoStatus } from '../../domain/entities/piloto/PilotoStatus';
import { IPilotoRepository } from '../../domain/interfaces/IPilotoRepository';
import { PILOTO_CONFIG } from '../../../constants/surveyConfig';

export class PilotoRepositoryImpl implements IPilotoRepository {
  /**
   * El estado del piloto vive DENTRO del documento del usuario,
   * en un campo llamado `piloto`. Así no hace falta otra colección.
   */
  private getUserDocRef(userId: string) {
    return doc(db, 'users', userId);
  }

  async getStatus(userId: string): Promise<PilotoStatus | null> {
    try {
      const snap = await getDoc(this.getUserDocRef(userId));
      if (!snap.exists()) return null;
      const data = snap.data();
      if (!data.piloto) return null;
      return PilotoStatus.fromJSON(data.piloto);
    } catch (error) {
      console.error('[Piloto] Error obteniendo status:', error);
      return null;
    }
  }

  async saveStatus(status: PilotoStatus): Promise<PilotoStatus> {
    try {
      await setDoc(
        this.getUserDocRef(status.userId),
        { piloto: status.toJSON() },
        { merge: true }
      );
      console.log('[Piloto] Status guardado:', status.userId, status.completado);
      return status;
    } catch (error) {
      console.error('[Piloto] Error guardando status:', error);
      throw error;
    }
  }

  async markAsStarted(userId: string, version: string): Promise<PilotoStatus> {
    const existing = await this.getStatus(userId);

    // Si ya existe un estado iniciado, no lo sobrescribimos.
    if (existing && existing.fechaInicio) {
      return existing;
    }

    const status = new PilotoStatus({
      userId,
      completado: false,
      fechaInicio: new Date(),
      fechaCierre: null,
      version,
    });

    return await this.saveStatus(status);
  }

  async markAsCompleted(userId: string): Promise<PilotoStatus> {
    const existing = await this.getStatus(userId);

    const status = new PilotoStatus({
      userId,
      completado: true,
      fechaInicio: existing?.fechaInicio ?? new Date(),
      fechaCierre: new Date(),
      version: existing?.version ?? PILOTO_CONFIG.VERSION,
    });

    return await this.saveStatus(status);
  }
}