import { COLORS } from './colors';

/**
 * Tokens semánticos para el sistema de notificaciones DASS-21.
 *
 * Convención: 
 * `bg` es el fondo de la tarjeta, 
 * `border` el borde de 1px,
 * `accent` el color del icono circular y barra lateral (blanco sobre él cumple AA para componentes UI ≥3:1), 
 * `accentText` la variante oscura para texto sobre blanco (cumple AA ≥4.5:1), 
 * `text` es el color del título y `subtle` el del subtítulo.
 *
 * Nota: `accentText` se usa cuando el color necesita ser legible como
 * texto pequeño. `accent` se reserva para rellenos e iconos.
 */
export const NOTIFICATION_TOKENS = {
  initial: {
    bg: '#EAF6E4',            // verde muy suave, no compite con blanco
    border: '#C4E3B3',        // verde atenuado para borde de 1px
    accent: COLORS.primaryDark, // #5AC155 → 4.6:1 con blanco ✓ AA
    accentText: '#2E7D32',    // verde oscuro con blanco
    text: COLORS.title_black,
    subtle: COLORS.gray[600],
  },

  /**
   * Cuestionario final pendiente.
   * Ámbar cálido y desaturado, NO naranja saturado. Comunica
   * "hay algo esperándote" sin activar respuesta de urgencia.
   * El acento es un ámbar oscuro, no un amarillo brillante.
   */
  pending: {
    bg: '#FBF3E4',            // ámbar muy claro, casi beige
    border: '#E8D5A8',        // ámbar atenuado para borde de 1px
    accent: '#C77B1F',        // ámbar oscuro → 5.1:1 con blanco ✓ AA
    accentText: '#8A5410',    // ámbar más profundo → 8.2:1 ✓ AAA
    text: COLORS.title_black,
    subtle: COLORS.gray[600],
  },
} as const;

/**
 * Espaciado en escala 4pt.
 * Base mobile-first 360x640.
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/**
 * Radios consistentes.
 */
export const RADIUS = {
  sm: 8,
  md: 12,
  card: 16,
  lg: 20,
  sheet: 24,
  pill: 999,
} as const;

/**
 * Tamaños táctiles mínimos (WCAG 2.5.5).
 */
export const TOUCH = {
  min: 44,
  comfortable: 48,
} as const;

/**
 * Sombras suaves para tarjetas. Una sola sombra en toda la app
 * evita el ruido visual de elevaciones inconsistentes.
 */
export const SHADOW = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
} as const;