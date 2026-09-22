// constants/autopercepcionQuestions.ts

export type AutopercepcionTipo = 'pretest' | 'postest';

export interface AutopercepcionQuestion {
  numero: number;
  afirmacion: string;
  /** ¿Aparece en pretest? */
  enPretest: boolean;
  /** ¿Aparece en postest? */
  enPostest: boolean;
}

export const AUTOPERCEPCION_QUESTIONS: AutopercepcionQuestion[] = [
  // ─── Ítems 1-7 (pretest y postest) ─────────────────────────
  {
    numero: 1,
    afirmacion: '¿Qué tan productivo/a te has sentido esta semana?',
    enPretest: true,
    enPostest: true,
  },
  {
    numero: 2,
    afirmacion: '¿Qué tan eficiente te has sentido al realizar tus tareas?',
    enPretest: true,
    enPostest: true,
  },
  {
    numero: 3,
    afirmacion: '¿Qué tan satisfecho/a estás con la cantidad de cosas que lograste hacer?',
    enPretest: true,
    enPostest: true,
  },
  {
    numero: 4,
    afirmacion: '¿Qué tan fácil te ha resultado concentrarte en tus actividades?',
    enPretest: true,
    enPostest: true,
  },
  {
    numero: 5,
    afirmacion: '¿Qué tan capaz te has sentido de organizar tu tiempo?',
    enPretest: true,
    enPostest: true,
  },
  {
    numero: 6,
    afirmacion: '¿Qué tan satisfecho/a estás con la calidad de tu trabajo esta semana?',
    enPretest: true,
    enPostest: true,
  },
  {
    numero: 7,
    afirmacion: '¿Qué tanto control has sentido sobre tu tiempo y tus actividades?',
    enPretest: true,
    enPostest: true,
  },

  // ─── Ítems 8-12 (solo postest) ─────────────────────────────
  {
    numero: 8,
    afirmacion: '¿Qué tan útil te resultó la bitácora emocional para entender tu estado de ánimo?',
    enPretest: false,
    enPostest: true,
  },
  {
    numero: 9,
    afirmacion: '¿Qué tan útil te resultó el módulo de relajación para reducir tu estrés?',
    enPretest: false,
    enPostest: true,
  },
  {
    numero: 10,
    afirmacion: '¿Qué tan útil te resultó el asistente Kii para sentirte acompañado/a?',
    enPretest: false,
    enPostest: true,
  },
  {
    numero: 11,
    afirmacion: '¿Qué tan motivador/a te resultó la mascota virtual?',
    enPretest: false,
    enPostest: true,
  },
  {
    numero: 12,
    afirmacion: '¿Qué tan útil te resultó la comunidad de hábitos para mantenerte constante?',
    enPretest: false,
    enPostest: true,
  },
];

/**
 * Devuelve las preguntas que corresponden al tipo de cuestionario.
 */
export function getAutopercepcionQuestions(
  tipo: AutopercepcionTipo
): AutopercepcionQuestion[] {
  return AUTOPERCEPCION_QUESTIONS.filter((q) =>
    tipo === 'pretest' ? q.enPretest : q.enPostest
  );
}