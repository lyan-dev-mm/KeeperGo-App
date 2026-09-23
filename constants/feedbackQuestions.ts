// constants/feedbackQuestions.ts

export const MODULOS_OPCIONES = [
  { id: 'bitacora',     label: 'Bitácora de emociones' },
  { id: 'relajacion',   label: 'Zona de relajación' },
  { id: 'mascota',      label: 'Mascota virtual (Kii)' },
  { id: 'comunidad',    label: 'Comunidad de hábitos' },
  { id: 'asistente',    label: 'Asistente Kii' },
  { id: 'especialistas', label: 'Derivación a especialistas' },
] as const;

export type ModuloId = typeof MODULOS_OPCIONES[number]['id'];