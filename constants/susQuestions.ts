// constants/susQuestions.ts

export interface SUSQuestion {
  numero: number;
  afirmacion: string;
  /** 'impar' → puntuación = respuesta - 1; 'par' → puntuación = 5 - respuesta */
  tipo: 'impar' | 'par';
}

export const SUS_QUESTIONS: SUSQuestion[] = [
  {
    numero: 1,
    afirmacion: 'Creo que me gustaría usar esta plataforma con frecuencia',
    tipo: 'impar',
  },
  {
    numero: 2,
    afirmacion: 'Encontré la plataforma innecesariamente compleja',
    tipo: 'par',
  },
  {
    numero: 3,
    afirmacion: 'Pensé que la plataforma era fácil de usar',
    tipo: 'impar',
  },
  {
    numero: 4,
    afirmacion: 'Creo que necesitaría apoyo de una persona técnica para poder usar esta plataforma',
    tipo: 'par',
  },
  {
    numero: 5,
    afirmacion: 'Encontré que las diversas funciones de esta plataforma estaban bien integradas',
    tipo: 'impar',
  },
  {
    numero: 6,
    afirmacion: 'Pensé que había demasiada inconsistencia en esta plataforma',
    tipo: 'par',
  },
  {
    numero: 7,
    afirmacion: 'Imagino que la mayoría de las personas aprenderían a usar esta plataforma muy rápidamente',
    tipo: 'impar',
  },
  {
    numero: 8,
    afirmacion: 'Encontré la plataforma muy difícil de usar',
    tipo: 'par',
  },
  {
    numero: 9,
    afirmacion: 'Me sentí muy seguro usando la plataforma',
    tipo: 'impar',
  },
  {
    numero: 10,
    afirmacion: 'Necesité aprender muchas cosas antes de poder empezar a usar esta plataforma',
    tipo: 'par',
  },
];