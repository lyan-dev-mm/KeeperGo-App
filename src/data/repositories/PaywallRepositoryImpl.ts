// src/data/repositories/PaywallRepositoryImpl.ts

import { db } from '../../infrastructure/firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { PaywallResponse } from '../../domain/entities/paywall/PaywallResponse';
import { IPaywallRepository } from '../../domain/interfaces/IPaywallRepository';

export class PaywallRepositoryImpl implements IPaywallRepository {
  private getDocRef(userId: string, responseId: string) {
    return doc(db, 'users', userId, 'paywall', responseId);
  }

  async saveResponse(response: PaywallResponse): Promise<PaywallResponse> {
    try {
      const docRef = this.getDocRef(response.userId, response.id);
      await setDoc(docRef, response.toJSON());
      console.log(
        '[Paywall] Guardado:',
        response.id,
        'intención:',
        response.intencionPago,
        '$129:',
        response.pagariaPrecioActual ? 'Sí' : 'No'
      );
      return response;
    } catch (error) {
      console.error('[Paywall] Error guardando:', error);
      throw error;
    }
  }

  async getResponse(userId: string): Promise<PaywallResponse | null> {
    try {
      const docRef = this.getDocRef(userId, `paywall_${userId}`);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return PaywallResponse.fromJSON(snap.data());
    } catch (error) {
      console.error('[Paywall] Error obteniendo:', error);
      return null;
    }
  }

  async hasCompleted(userId: string): Promise<boolean> {
    const r = await this.getResponse(userId);
    return !!r?.completado;
  }
}