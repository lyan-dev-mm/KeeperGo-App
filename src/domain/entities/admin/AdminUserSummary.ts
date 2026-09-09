export interface AdminUserSummary {
  uid: string;
  email: string;
  name?: string;
  createdAt?: string;
  petName?: string;
  level?: number;
  currentStreak?: number;
  bestStreak?: number;
  unlockedPetIds?: string[];
  disabled?: boolean;
}