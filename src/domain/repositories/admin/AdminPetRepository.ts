export interface PetStatsUpdate {
  currentStreak?: number;
  bestStreak?: number;
  level?: number;
  currentXP?: number;
}

export interface AdminPetRepository {
  updatePetStats(uid: string, updates: PetStatsUpdate): Promise<void>;
}}