import { PetRepository } from '../../repositories/mascota/PetRepository';
import { PetEntity } from '../../entities/mascota/Pet';
import { GetPetUseCase } from './GetPetUseCase';
import { getTodayKey, getYesterdayKey } from '../../../utils/dateUtils';
import { getXpRequiredForLevel } from '../../../utils/xpUtils';
import { MilestoneRepository } from '../../repositories/mascota/MilestoneRepository';
import { MilestoneEntity } from '../../entities/mascota/Milestone';
import { GetMilestonesUseCase } from './GetMilestonesUseCase';

const TEST_XP_REWARD = 50;

export interface RegisterActivityResult {
  pet: PetEntity;
  streakIncreased: boolean;
  leveledUp: boolean;
  unlockedMilestone: MilestoneEntity | null;
}

export class RegisterActivityUseCase {
  private getPetUseCase: GetPetUseCase;
  private getMilestonesUseCase: GetMilestonesUseCase;

  constructor(private repository: PetRepository, milestoneRepository: MilestoneRepository) {
    this.getPetUseCase = new GetPetUseCase(repository);
    this.getMilestonesUseCase = new GetMilestonesUseCase(milestoneRepository);
  }

  async execute(userId: string): Promise<RegisterActivityResult> {
    const pet = await this.getPetUseCase.execute(userId);
    const todayKey = getTodayKey();
    const yesterdayKey = getYesterdayKey();

    if (pet.lastActivityDate === todayKey) {
      return { pet, streakIncreased: false, leveledUp: false, unlockedMilestone: null };
    }

    const continuesStreak = pet.lastActivityDate === yesterdayKey;
    const newStreak = continuesStreak ? pet.currentStreak + 1 : 1;
    const previousBest = pet.bestStreak;
    const newBest = Math.max(previousBest, newStreak);
    const newActiveDates = pet.activeDates.includes(todayKey)
      ? pet.activeDates
      : [...pet.activeDates, todayKey];

    let { level, currentXP } = pet;
    const startingLevel = level;
    currentXP += TEST_XP_REWARD;
    let required = getXpRequiredForLevel(level);
    while (currentXP >= required) {
      currentXP -= required;
      level += 1;
      required = getXpRequiredForLevel(level);
    }

    // Puntos de alimento: contador independiente del XP de nivel, usado
    // para "alimentar" mascotas y hacerlas crecer. Se reinicia a 0 cada vez
    // que el usuario alimenta a alguna mascota (ver FeedPetUseCase).
    const feedingPoints = (pet.feedingPoints ?? 0) + TEST_XP_REWARD;

    let unlockedMilestone: MilestoneEntity | null = null;
    try {
      const milestones = await this.getMilestonesUseCase.execute();
      unlockedMilestone = milestones.find((m) => previousBest < m.days && newBest >= m.days) ?? null;
    } catch {
      // Silencioso: si falla la carga de hitos, no se detecta el
      // desbloqueo esa vez, pero el resto del registro sigue funcionando.
    }

    const updated: PetEntity = {
      ...pet,
      currentStreak: newStreak,
      bestStreak: newBest,
      activeDates: newActiveDates,
      lastActivityDate: todayKey,
      level,
      currentXP,
      feedingPoints,
      updatedAt: new Date().toISOString(),
    };

    await this.repository.savePet(updated);

    return {
      pet: updated,
      streakIncreased: true,
      leveledUp: level > startingLevel,
      unlockedMilestone,
    };
  }
}