import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { AdminPetOptionRepository } from '../../../domain/repositories/admin/AdminPetOptionRepository';
import { PetOptionEntity } from '../../../domain/entities/mascota/PetOption';

const COLLECTION = 'pet_options';

export class AdminPetOptionRepositoryImpl implements AdminPetOptionRepository {
  async getAllPetOptions(): Promise<PetOptionEntity[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PetOptionEntity));
  }

  async createPetOption(data: Omit<PetOptionEntity, 'id'>): Promise<void> {
    await addDoc(collection(db, COLLECTION), data);
  }

  async updatePetOption(id: string, data: Omit<PetOptionEntity, 'id'>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { ...data });
  }

  async deletePetOption(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }
}