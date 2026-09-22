import { db } from '../../infrastructure/firebase/firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { DASS21Response, DASS21Tipo } from '../../domain/entities/dass21/DASS21Response';
import { IDASS21Repository } from '../../domain/interfaces/IDass21Repository';

export class DASS21RepositoryImpl implements IDASS21Repository {
  private getUserCollection(userId: string) {
    return collection(db, 'users', userId, 'dass21');
  }

  private getDocRef(userId: string, responseId: string) {
    return doc(db, 'users', userId, 'dass21', responseId);
  }

  async saveResponse(response: DASS21Response): Promise<DASS21Response> {
    try {
      // ID determinístico => setDoc sobrescribe si ya existía.
      const docRef = this.getDocRef(response.userId, response.id);
      await setDoc(docRef, response.toJSON());
      console.log('[DASS21] Guardado:', response.id, response.tipo);
      return response;
    } catch (error) {
      console.error('[DASS21] Error guardando:', error);
      throw error;
    }
  }

  async getResponses(userId: string): Promise<DASS21Response[]> {
    try {
      const snapshot = await getDocs(this.getUserCollection(userId));
      const responses = snapshot.docs.map((d) => DASS21Response.fromJSON(d.data()));
      // Orden en memoria: máximo 2 documentos por usuario.
      return responses.sort(
        (a, b) => b.fecha.getTime() - a.fecha.getTime()
      );
    } catch (error) {
      console.error('[DASS21] Error obteniendo respuestas:', error);
      return [];
    }
  }

  async getResponseByTipo(
    userId: string,
    tipo: DASS21Tipo
  ): Promise<DASS21Response | null> {
    try {
      const q = query(
        this.getUserCollection(userId),
        where('tipo', '==', tipo),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return DASS21Response.fromJSON(snapshot.docs[0].data());
    } catch (error) {
      console.error('[DASS21] Error obteniendo por tipo:', error);
      return null;
    }
  }

  async hasCompletedInicial(userId: string): Promise<boolean> {
    const r = await this.getResponseByTipo(userId, 'inicial');
    return !!r?.completado;
  }

  async hasCompletedFinal(userId: string): Promise<boolean> {
    const r = await this.getResponseByTipo(userId, 'final');
    return !!r?.completado;
  }
}