// constants/paywallQuestions.ts

export const PAYWALL_CONFIG = {
  PRECIO_MENSUAL_MXN: 129,
  FUNCIONALIDADES_PREMIUM: [
    { id: 'chat-kii',        label: 'Chat ilimitado con Kii' },
    { id: 'reportes',        label: 'Reportes de progreso avanzados' },
    { id: 'ejercicios',      label: 'Ejercicios personalizados' },
    { id: 'mascota',         label: 'Mascota con más evoluciones' },
    { id: 'especialistas',   label: 'Derivación prioritaria a especialistas' },
  ] as const,
  TITULO: 'Ayúdanos a mejorar',
  SUBTITULO: 'Solo 4 preguntas rápidas',
} as const;

export type FuncionalidadPremiumId =
  typeof PAYWALL_CONFIG.FUNCIONALIDADES_PREMIUM[number]['id'];

export type IntencionPago = 'si' | 'tal_vez' | 'no';