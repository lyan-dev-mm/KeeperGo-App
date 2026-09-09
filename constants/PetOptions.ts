export interface PetOption {
  id: string;
  name: string;
  emoji: string;
  imageSource: any | null;
  unlockDays: number;
}

export const PET_OPTIONS: PetOption[] = [
  { id: 'sapo', name: 'Sapo', emoji: '🐸', imageSource: null, unlockDays: 0 },
  { id: 'ballena', name: 'Ballena', emoji: '🐋', imageSource: null, unlockDays: 15 },
  { id: 'perezoso', name: 'Perezoso', emoji: '🦥', imageSource: null, unlockDays: 30 },
  { id: 'abeja', name: 'Abeja', emoji: '🐝', imageSource: null, unlockDays: 60 },
  { id: 'polilla', name: 'Polilla', emoji: '🦋', imageSource: null, unlockDays: 100 },
];

export const DEFAULT_PET_ID = 'sapo';

export function getPetOption(id: string): PetOption {
  return PET_OPTIONS.find((p) => p.id === id) ?? PET_OPTIONS[0];
}

// Ahora una mascota se considera desbloqueada si el usuario alcanzó los días
// necesarios POR SU CUENTA, o si un administrador la desbloqueó manualmente
// (independiente de su racha real).
export function isPetUnlocked(
  petOption: PetOption,
  bestStreak: number,
  unlockedPetIds: string[] = []
): boolean {
  return bestStreak >= petOption.unlockDays || unlockedPetIds.includes(petOption.id);
}