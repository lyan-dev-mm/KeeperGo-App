import { PetEntity } from '../entities/Pet';

export interface PetRepository {
  getPet(userId: string): Promise<PetEntity | null>;
  savePet(pet: PetEntity): Promise<void>;
}