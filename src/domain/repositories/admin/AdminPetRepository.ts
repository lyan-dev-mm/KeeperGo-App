export interface PetStatsUpdate {
  currentStreak?: number;
  bestStreak?: number;
  level?: number;
  currentXP?: number;
  lastActivityDate?: string | null;
  unlockedPetIds?: string[];
}

export interface AdminPetRepository {
  updatePetStats(uid: string, updates: PetStatsUpdate): Promise<void>;
}