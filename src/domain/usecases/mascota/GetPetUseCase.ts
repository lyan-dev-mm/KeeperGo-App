import { PetRepository } from '../../repositories/mascota/PetRepository';
import { PetEntity, createDefaultPet } from '../../entities/mascota/Pet';
import { getTodayKey, getYesterdayKey } from '../../../utils/dateUtils';

export class GetPetUseCase {
  constructor(private repository: PetRepository) {}

  async execute(userId: string): Promise<PetEntity> {
    let pet = await this.repository.getPet(userId);

    if (!pet) {
      pet = createDefaultPet(userId);
      await this.repository.savePet(pet);
      return pet;
    }

    const todayKey = getTodayKey();
    const yesterdayKey = getYesterdayKey();

    if (pet.lastActivityDate && pet.lastActivityDate !== todayKey && pet.lastActivityDate !== yesterdayKey) {
      const reset: PetEntity = {
        ...pet,
        currentStreak: 0,
        updatedAt: new Date().toISOString(),
      };
      await this.repository.savePet(reset);
      return reset;
    }

    return pet;
  }
}