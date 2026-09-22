import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { PetOptionRepository } from '../../../domain/repositories/mascota/PetOptionRepository';
import { PetOptionEntity } from '../../../domain/entities/mascota/PetOption';

const COLLECTION = 'pet_options';

export class PetOptionRepositoryImpl implements PetOptionRepository {
  async getAllPetOptions(): Promise<PetOptionEntity[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PetOptionEntity));
  }
}