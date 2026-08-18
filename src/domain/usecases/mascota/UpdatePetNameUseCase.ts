import { PetRepository } from '../../repositories/mascota/PetRepository';
import { PetEntity } from '../../entities/mascota/Pet';
import { GetPetUseCase } from './GetPetUseCase';

export class UpdatePetNameUseCase {
  private getPetUseCase: GetPetUseCase;

  constructor(private repository: PetRepository) {
    this.getPetUseCase = new GetPetUseCase(repository);
  }

  async execute(userId: string, newName: string): Promise<PetEntity> {
    const pet = await this.getPetUseCase.execute(userId);
    const updated: PetEntity = {
      ...pet,
      name: newName.trim(),
      updatedAt: new Date().toISOString(),
    };
    await this.repository.savePet(updated);
    return updated;
  }
}