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

    if (!pet.lastActivityDate) {
      return pet;
    }

    const todayKey = getTodayKey();
    const yesterdayKey = getYesterdayKey();

    // Solo reiniciamos la racha si la última actividad quedó CLARAMENTE en
    // el pasado (ni hoy ni ayer). Si por alguna razón quedó en el futuro
    // (por ejemplo, un reloj de dispositivo mal configurado durante
    // pruebas), no lo tratamos como un día perdido — evita romper la racha
    // por errores de reloj, no por inactividad real.
    const isClearlyMissedDay = pet.lastActivityDate < todayKey && pet.lastActivityDate !== yesterdayKey;

    if (isClearlyMissedDay) {
      const reset: PetEntity = {
        ...pet,
        currentStreak: 0,
        lastActivityDate: null, // se limpia para que no se re-evalúe en cada carga
        updatedAt: new Date().toISOString(),
      };
      await this.repository.savePet(reset);
      return reset;
    }

    return pet;
  }
}