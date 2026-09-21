export interface PetGrowthStage {
  id: string;
  name: string;
  emoji: string;
  imageUrl: string | null;
  minGrowth: number;
}

export interface PetOptionEntity {
  id: string;
  name: string;
  emoji: string;
  unlockDays: number;
  stages: PetGrowthStage[];
}

export function isPetOptionUnlocked(
  option: PetOptionEntity,
  bestStreak: number,
  unlockedPetIds: string[] = []
): boolean {
  return bestStreak >= option.unlockDays || unlockedPetIds.includes(option.id);
}

function getSortedStages(option: PetOptionEntity): PetGrowthStage[] {
  const stages =
    option.stages && option.stages.length > 0
      ? option.stages
      : [{ id: 'default', name: option.name, emoji: option.emoji, imageUrl: null, minGrowth: 0 }];
  return [...stages].sort((a, b) => a.minGrowth - b.minGrowth);
}

export function getCurrentStage(option: PetOptionEntity, growth: number): PetGrowthStage {
  const sorted = getSortedStages(option);
  let current = sorted[0];
  for (const stage of sorted) {
    if (growth >= stage.minGrowth) current = stage;
  }
  return current;
}

export function getNextStage(option: PetOptionEntity, growth: number): PetGrowthStage | null {
  const sorted = getSortedStages(option);
  return sorted.find((stage) => stage.minGrowth > growth) ?? null;
}