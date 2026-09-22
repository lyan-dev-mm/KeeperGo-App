/**
 * Configuración del estudio DASS-21 para el piloto ITSCHI.
 * Piloto de 5 días: pretest Día 1, postest Día 5.
 */
export const DASS21_CONFIG = {
  /** Día del piloto en que se aplica el pretest */
  DIA_PRETEST: 1,
  /** Día del piloto en que se aplica el postest */
  DIA_POSTEST: 5,
  /** Días de espera entre pretest y postest (Día 5 - Día 1 = 4) */
  DIAS_ESPERA: 0.001,
  /** Milisegundos por día */
  MS_POR_DIA: 24 * 60 * 60 * 1000,
  /** Total de preguntas del DASS-21 */
  TOTAL_PREGUNTAS: 21,
} as const;

/**
 * Ítems oficiales por subescala (Lovibond & Lovibond, 1995).
 * Numeración 1-based para coincidir con DASS21_QUESTIONS.
 * NO reordenar sin actualizar el test unitario.
 */
export const DASS21_SUBESCALAS = {
  depresion: [3, 5, 10, 13, 16, 17, 21],
  ansiedad:  [2, 4, 7, 9, 15, 19, 20],
  estres:    [1, 6, 8, 11, 12, 14, 18],
} as const;

/**
 * Puntos de corte oficiales del DASS-21
 * Fuente: Lovibond & Lovibond (1995), versión de 21 ítems.
 */
export const DASS21_CORTES = {
  depresion: { normal: 4, leve: 6, moderado: 10, severo: 13 },
  ansiedad:  { normal: 3, leve: 5, moderado: 7,  severo: 9  },
  estres:    { normal: 7, leve: 9, moderado: 12, severo: 16 },
} as const;