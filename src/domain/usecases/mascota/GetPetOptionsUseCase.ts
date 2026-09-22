import { PetOptionRepository } from '../../repositories/mascota/PetOptionRepository';
import { PetOptionEntity } from '../../entities/mascota/PetOption';

export class GetPetOptionsUseCase {
  constructor(private repository: PetOptionRepository) {}

  async execute(): Promise<PetOptionEntity[]> {
    const options = await this.repository.getAllPetOptions();
    return options.sort((a, b) => a.unlockDays - b.unlockDays);
  }
}