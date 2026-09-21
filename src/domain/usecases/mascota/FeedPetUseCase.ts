import { PetRepository } from '../../repositories/mascota/PetRepository';
import { PetOptionRepository } from '../../repositories/mascota/PetOptionRepository';
import { PetEntity } from '../../entities/mascota/Pet';
import { isPetOptionUnlocked } from '../../entities/mascota/PetOption';
import { GetPetUseCase } from './GetPetUseCase';

export class FeedPetUseCase {
  private getPetUseCase: GetPetUseCase;

  constructor(
    private repository: PetRepository,
    private petOptionRepository: PetOptionRepository
  ) {
    this.getPetUseCase = new GetPetUseCase(repository);
  }

  async execute(userId: string, targetPetOptionId: string): Promise<PetEntity> {
    const pet = await this.getPetUseCase.execute(userId);
    const options = await this.petOptionRepository.getAllPetOptions();
    const option = options.find((o) => o.id === targetPetOptionId);

    if (!option) {
      throw new Error('Esa mascota ya no está disponible.');
    }

    const unlockedPetIds = pet.unlockedPetIds ?? [];
    if (!isPetOptionUnlocked(option, pet.bestStreak, unlockedPetIds)) {
      throw new Error(`Todavía no puedes alimentar a "${option.name}" — no está desbloqueada.`);
    }

    const feedingPoints = pet.feedingPoints ?? 0;
    if (feedingPoints <= 0) {
      throw new Error('No tienes puntos de alimento disponibles todavía.');
    }

    const currentGrowth = pet.petGrowth ?? {};
    const updatedGrowth = {
      ...currentGrowth,
      [targetPetOptionId]: (currentGrowth[targetPetOptionId] ?? 0) + feedingPoints,
    };

    const updated: PetEntity = {
      ...pet,
      petGrowth: updatedGrowth,
      feedingPoints: 0,
      updatedAt: new Date().toISOString(),
    };

    await this.repository.savePet(updated);
    return updated;
  }
}