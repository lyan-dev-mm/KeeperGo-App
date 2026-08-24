import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { AdminPetRepository, PetStatsUpdate } from '../../../domain/repositories/admin/AdminPetRepository';

export class AdminPetRepositoryImpl implements AdminPetRepository {
  async updatePetStats(uid: string, updates: PetStatsUpdate): Promise<void> {
    await updateDoc(doc(db, 'mascotas', uid), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }
}