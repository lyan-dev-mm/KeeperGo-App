import { AdminPetOptionRepository } from '../../repositories/admin/AdminPetOptionRepository';
import { PetOptionEntity } from '../../entities/mascota/PetOption';

export class ManagePetOptionsUseCase {
  constructor(private repository: AdminPetOptionRepository) {}

  getAll() {
    return this.repository.getAllPetOptions();
  }

  create(data: Omit<PetOptionEntity, 'id'>) {
    return this.repository.createPetOption(data);
  }

  update(id: string, data: Omit<PetOptionEntity, 'id'>) {
    return this.repository.updatePetOption(id, data);
  }

  remove(id: string) {
    return this.repository.deletePetOption(id);
  }
}