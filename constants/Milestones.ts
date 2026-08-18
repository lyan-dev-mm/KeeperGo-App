export interface Milestone {
  days: number;
  label: string;
}

export const MILESTONES: Milestone[] = [
  { days: 3, label: 'Primeros pasos' },
  { days: 7, label: 'Una semana completa' },
  { days: 15, label: 'Medio mes' },
  { days: 30, label: 'Un mes entero' },
  { days: 60, label: 'Dos meses seguidos' },
  { days: 100, label: 'Racha legendaria' },
];

export function getNextMilestone(bestStreak: number): Milestone | null {
  return MILESTONES.find((m) => bestStreak < m.days) ?? null;
}