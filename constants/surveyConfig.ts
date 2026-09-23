
/**
 * Configuración de los instrumentos del piloto.
 * Centraliza textos, escalas, totales y metadatos.
 * Los ítems viven en archivos separados (para mantener este archivo liviano).
 */

// ─────────────────────────────────────────────────────────────
// AUTOPERCEPCIÓN DE PRODUCTIVIDAD
// ─────────────────────────────────────────────────────────────
export const AUTOPERCEPCION_CONFIG = {
  TOTAL_ITEMS_PRETEST: 7,
  TOTAL_ITEMS_POSTEST: 12,
  ESCALA_MIN: 1,
  ESCALA_MAX: 5,
  ESCALA_LABELS: {
    1: 'Nada',
    2: 'Poco',
    3: 'Regular',
    4: 'Bastante',
    5: 'Mucho',
  } as const,
  TITULO: 'Autopercepción de productividad',
  SUBTITULO: 'Pensando en tu semana académica',
  INSTRUCCIONES:
    'Responde las siguientes preguntas pensando en cómo te has sentido esta semana en tus actividades académicas o laborales.',
} as const;

// ─────────────────────────────────────────────────────────────
// SUS — SYSTEM USABILITY SCALE
// ─────────────────────────────────────────────────────────────
export const SUS_CONFIG = {
  TOTAL_ITEMS: 10,
  ESCALA_MIN: 1,
  ESCALA_MAX: 5,
  ESCALA_LABELS: {
    1: 'Totalmente en desacuerdo',
    2: 'En desacuerdo',
    3: 'Neutral',
    4: 'De acuerdo',
    5: 'Totalmente de acuerdo',
  } as const,
  ESCALA_LABELS_CORTOS: {
    1: 'Muy en desacuerdo',
    2: 'Desacuerdo',
    3: 'Neutral',
    4: 'Acuerdo',
    5: 'Muy de acuerdo',
  } as const,
  UMBRAL_PROMEDIO: 68, // > 68 = por encima del promedio (Sauro, 2011)
  TITULO: 'Experiencia de uso',
  SUBTITULO: 'Cuéntanos cómo te sentiste usando Keeper Go',
  INSTRUCCIONES:
    'Después de haber usado Keeper Go durante estos 5 días, indica tu grado de acuerdo con cada una de las siguientes afirmaciones.',
} as const;

// ─────────────────────────────────────────────────────────────
// FEEDBACK + NPS
// ─────────────────────────────────────────────────────────────
export const FEEDBACK_CONFIG = {
  NPS_MIN: 0,
  NPS_MAX: 10,
  NPS_DETRACTOR_MAX: 6,   // 0-6 → detractor
  NPS_PASIVO_MAX: 8,      // 7-8 → pasivo
  // 9-10 → promotor
  TITULO: 'Tu opinión importa',
  SUBTITULO: 'Cuéntanos qué te pareció Keeper Go',
} as const;

// ─────────────────────────────────────────────────────────────
// PAYWALL / DISPOSICIÓN A PAGAR (borrador — ajustable después)
// ─────────────────────────────────────────────────────────────
export const PAYWALL_CONFIG = {
  PRECIO_SIMULADO_MXN: 79, // Precio de prueba para la pregunta Gabor-Granger
  FUNCIONALIDADES_PREMIUM: [
    'Chat ilimitado con Kii',
    'Reportes de progreso avanzados',
    'Ejercicios personalizados',
    'Mascota con más evoluciones',
    'Derivación prioritaria a especialistas',
  ] as const,
  TITULO: 'Ayúdanos a mejorar',
  SUBTITULO: 'Solo 4 preguntas rápidas',
} as const;

// ─────────────────────────────────────────────────────────────
// PILOTO
// ─────────────────────────────────────────────────────────────
export const PILOTO_CONFIG = {
  DIAS_TOTALES: 5,
  DIA_PRETEST: 1,
  DIA_POSTEST: 5,
  VERSION: 'v1',
  INSTITUCION: 'ITSCHI',
} as const;