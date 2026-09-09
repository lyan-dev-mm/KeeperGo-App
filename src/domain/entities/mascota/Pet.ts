export interface PetEntity {
  id: string;
  userId: string;
  name: string;
  level: number;
  currentXP: number;
  currentStreak: number;
  bestStreak: number;
  activeDates: string[];
  lastActivityDate: string | null;
  selectedPetId: string;
  unlockedPetIds: string[];
  feedingPoints: number;
  petGrowth: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export function createDefaultPet(userId: string): PetEntity {
  const now = new Date().toISOString();
  return {
    id: userId,
    userId,
    name: 'Mi Racha',
    level: 1,
    currentXP: 0,
    currentStreak: 0,
    bestStreak: 0,
    activeDates: [],
    lastActivityDate: null,
    selectedPetId: '',
    unlockedPetIds: [],
    feedingPoints: 0,
    petGrowth: {},
    createdAt: now,
    updatedAt: now,
  };
}