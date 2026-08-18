// Fórmula de XP requerida por nivel: 300 + (nivel-1) * 100
// Nivel 1 → 300 XP | Nivel 7 → 900 XP (coincide con tu referencia visual)
export function getXpRequiredForLevel(level: number): number {
  return 300 + (level - 1) * 100;
}