import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { PetRepository } from '../../../domain/repositories/mascota/PetRepository';
import { PetEntity } from '../../../domain/entities/mascota/Pet';

export class PetRepositoryImpl implements PetRepository {
  private getDocRef(userId: string) {
    return doc(db, 'mascotas', userId);
  }

  async getPet(userId: string): Promise<PetEntity | null> {
    const snapshot = await getDoc(this.getDocRef(userId));
    if (!snapshot.exists()) {
      return null;
    }
    return snapshot.data() as PetEntity;
  }

  async savePet(pet: PetEntity): Promise<void> {
    await setDoc(this.getDocRef(pet.userId), pet);
  }
}