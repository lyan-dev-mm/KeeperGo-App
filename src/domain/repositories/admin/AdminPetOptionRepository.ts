import { PetOptionEntity } from '../../entities/mascota/PetOption';

export interface AdminPetOptionRepository {
  getAllPetOptions(): Promise<PetOptionEntity[]>;
  createPetOption(data: Omit<PetOptionEntity, 'id'>): Promise<void>;
  updatePetOption(id: string, data: Omit<PetOptionEntity, 'id'>): Promise<void>;
  deletePetOption(id: string): Promise<void>;
}