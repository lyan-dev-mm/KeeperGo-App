import { MessageCategory } from './MotivationalMessage';

export type PetEventType =
  | 'ACTIVIDAD_COMPLETADA'
  | 'RACHA_AUMENTADA'
  | 'NUEVO_NIVEL'
  | 'RECOMPENSA_DESBLOQUEADA'
  | 'INTERACCION_MASCOTA'
  | 'BIENVENIDA';

export type PetAnimationType =
  | 'jump'
  | 'spin'
  | 'wiggle'
  | 'bounce'
  | 'pulse'
  | 'wave'
  | 'celebrate'
  | 'reward'
  | 'levelUp';

export interface PetReaction {
  event: PetEventType;
  animation: PetAnimationType;
  message: string | null;
}

// Animación FIJA por evento importante (no aleatoria)
// subir de nivel, aumentar racha o desbloquear una recompensa siempre usan
// la misma animación asociada a ese evento.
export const EVENT_ANIMATION: Record<Exclude<PetEventType, 'INTERACCION_MASCOTA'>, PetAnimationType> = {
  ACTIVIDAD_COMPLETADA: 'celebrate',
  RACHA_AUMENTADA: 'jump',
  NUEVO_NIVEL: 'levelUp',
  RECOMPENSA_DESBLOQUEADA: 'reward',
  BIENVENIDA: 'wave',
};

// Animaciones posibles para un simple toque — aquí sí es aleatorio,
// para que la mascota no se sienta repetitiva.
export const TAP_ANIMATIONS: PetAnimationType[] = [
  'jump',
  'spin',
  'wiggle',
  'bounce',
  'pulse',
  'wave',
  'celebrate',
];

export function pickRandomTapAnimation(exclude?: PetAnimationType): PetAnimationType {
  const options = exclude ? TAP_ANIMATIONS.filter((a) => a !== exclude) : TAP_ANIMATIONS;
  const pool = options.length > 0 ? options : TAP_ANIMATIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Categoría de mensaje motivacional asociada a cada evento.
// INTERACCION_MASCOTA no tiene categoría: un simple toque solo dispara
// animación, sin necesidad de un mensaje de la base de datos.
export const EVENT_CATEGORY_MAP: Record<PetEventType, MessageCategory | null> = {
  ACTIVIDAD_COMPLETADA: 'actividad',
  RACHA_AUMENTADA: 'racha',
  NUEVO_NIVEL: 'nivel',
  RECOMPENSA_DESBLOQUEADA: 'recompensa',
  BIENVENIDA: 'bienvenida',
  INTERACCION_MASCOTA: null,
};

// Mensajes de respaldo si Firestore falla o la categoría no tiene mensajes
// activos todavía — la mascota nunca debe quedarse "muda".
export const DEFAULT_EVENT_MESSAGES: Record<PetEventType, string> = {
  ACTIVIDAD_COMPLETADA: '¡Bien hecho! Otro paso hacia tu bienestar.',
  RACHA_AUMENTADA: '¡Tu constancia está dando frutos!',
  NUEVO_NIVEL: '¡Subiste de nivel! Todo ese esfuerzo está dando resultados.',
  RECOMPENSA_DESBLOQUEADA: '¡Desbloqueaste una recompensa, la merecías!',
  BIENVENIDA: 'Qué bueno tenerte de vuelta.',
  INTERACCION_MASCOTA: '',
};