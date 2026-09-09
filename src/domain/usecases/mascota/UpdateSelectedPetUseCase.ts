import { PetRepository } from '../../repositories/mascota/PetRepository';
import { PetOptionRepository } from '../../repositories/mascota/PetOptionRepository';
import { PetEntity } from '../../entities/mascota/Pet';
import { isPetOptionUnlocked } from '../../entities/mascota/PetOption';
import { GetPetUseCase } from './GetPetUseCase';

export class UpdateSelectedPetUseCase {
  private getPetUseCase: GetPetUseCase;

  constructor(
    private repository: PetRepository,
    private petOptionRepository: PetOptionRepository
  ) {
    this.getPetUseCase = new GetPetUseCase(repository);
  }

  async execute(userId: string, petId: string): Promise<PetEntity> {
    const pet = await this.getPetUseCase.execute(userId);
    const options = await this.petOptionRepository.getAllPetOptions();
    const option = options.find((o) => o.id === petId);

    if (!option) {
      throw new Error('Esa mascota ya no está disponible.');
    }

    // Validamos aquí también (no solo en la UI), tomando en cuenta tanto la
    // racha real como cualquier desbloqueo manual hecho por un admin.
    if (!isPetOptionUnlocked(option, pet.bestStreak, pet.unlockedPetIds)) {
      throw new Error(`"${option.name}" todavía no está desbloqueada.`);
    }

    const updated: PetEntity = {
      ...pet,
      selectedPetId: option.id,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.savePet(updated);
    return updated;
  }
}