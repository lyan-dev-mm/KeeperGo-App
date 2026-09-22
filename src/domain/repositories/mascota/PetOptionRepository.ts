import { PetOptionEntity } from '../../entities/mascota/PetOption';

export interface PetOptionRepository {
  getAllPetOptions(): Promise<PetOptionEntity[]>;
}