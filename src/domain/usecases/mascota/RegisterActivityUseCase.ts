import { PetRepository } from '../../repositories/mascota/PetRepository';
import { PetEntity } from '../../entities/mascota/Pet';
import { GetPetUseCase } from './GetPetUseCase';
import { getTodayKey, getYesterdayKey } from '../../../utils/dateUtils';
import { getXpRequiredForLevel } from '../../../utils/xpUtils';
import { MILESTONES, Milestone } from '../../../../constants/Milestones';

const TEST_XP_REWARD = 50;

export interface RegisterActivityResult {
  pet: PetEntity;
  streakIncreased: boolean;
  leveledUp: boolean;
  unlockedMilestone: Milestone | null;
}

export class RegisterActivityUseCase {
  private getPetUseCase: GetPetUseCase;

  constructor(private repository: PetRepository) {
    this.getPetUseCase = new GetPetUseCase(repository);
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

    const unlockedMilestone =
      MILESTONES.find((m) => previousBest < m.days && newBest >= m.days) ?? null;

    const updated: PetEntity = {
      ...pet,
      currentStreak: newStreak,
      bestStreak: newBest,
      activeDates: newActiveDates,
      lastActivityDate: todayKey,
      level,
      currentXP,
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