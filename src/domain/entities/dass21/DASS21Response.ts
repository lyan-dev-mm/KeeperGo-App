import {
  DASS21_CONFIG,
  DASS21_CORTES,
  DASS21_SUBESCALAS,
} from '../../../../constants/dass21Config';

export type DASS21Tipo = 'inicial' | 'final';

export interface DASS21Item {
  numero: number;
  afirmacion: string;
  respuesta: 0 | 1 | 2 | 3 | null;
}

export interface DASS21Subescalas {
  depresion: number;
  ansiedad: number;
  estres: number;
}

export type DASS21Nivel =
  | 'normal'
  | 'leve'
  | 'moderado'
  | 'severo'
  | 'extremadamente_severo';

export interface DASS21ResponseProps {
  id?: string;
  userId: string;
  emailInstitucional: string;
  tipo: DASS21Tipo;
  respuestas: number[];
  fecha: Date;
  completado: boolean;
  puntuacionTotal?: number;
  subescalas?: DASS21Subescalas;
}

export class DASS21Response {
  id: string;
  userId: string;
  emailInstitucional: string;
  tipo: DASS21Tipo;
  respuestas: number[];
  fecha: Date;
  completado: boolean;
  puntuacionTotal: number;
  subescalas: DASS21Subescalas;

  constructor({
    id,
    userId,
    emailInstitucional,
    tipo,
    respuestas,
    fecha,
    completado,
    puntuacionTotal,
    subescalas,
  }: DASS21ResponseProps) {
    // ID determinístico: un documento por (userId, tipo). Idempotente.
    this.id = id ?? `dass21_${userId}_${tipo}`;
    this.userId = userId;
    this.emailInstitucional = emailInstitucional;
    this.tipo = tipo;
    this.respuestas = respuestas;
    this.fecha = fecha;
    this.completado = completado;

    const puntuaciones = this.calcularPuntuaciones(respuestas);
    this.puntuacionTotal = puntuacionTotal ?? puntuaciones.total;
    this.subescalas = subescalas ?? puntuaciones.subescalas;
  }

  /**
   * Calcula las puntuaciones del DASS-21.
   * Escala original 0-3 por ítem. (decisión del estudio).
   * Los cortes aplicados en getNivel* son los del DASS-21.
   */
  private calcularPuntuaciones(respuestas: number[]): {
    total: number;
    subescalas: DASS21Subescalas;
  } {
    if (respuestas.length !== DASS21_CONFIG.TOTAL_PREGUNTAS) {
      return {
        total: 0,
        subescalas: { depresion: 0, ansiedad: 0, estres: 0 },
      };
    }

    const sumar = (items: readonly number[]) =>
      items.reduce((acc, num) => acc + (respuestas[num - 1] ?? 0), 0);

    const depresion = sumar(DASS21_SUBESCALAS.depresion);
    const ansiedad  = sumar(DASS21_SUBESCALAS.ansiedad);
    const estres    = sumar(DASS21_SUBESCALAS.estres);
    const total     = depresion + ansiedad + estres;

    return { total, subescalas: { depresion, ansiedad, estres } };
  }

  getNivelDepresion(): DASS21Nivel {
    const p = this.subescalas.depresion;
    const c = DASS21_CORTES.depresion;
    if (p <= c.normal)   return 'normal';
    if (p <= c.leve)     return 'leve';
    if (p <= c.moderado) return 'moderado';
    if (p <= c.severo)   return 'severo';
    return 'extremadamente_severo';
  }

  getNivelAnsiedad(): DASS21Nivel {
    const p = this.subescalas.ansiedad;
    const c = DASS21_CORTES.ansiedad;
    if (p <= c.normal)   return 'normal';
    if (p <= c.leve)     return 'leve';
    if (p <= c.moderado) return 'moderado';
    if (p <= c.severo)   return 'severo';
    return 'extremadamente_severo';
  }

  getNivelEstres(): DASS21Nivel {
    const p = this.subescalas.estres;
    const c = DASS21_CORTES.estres;
    if (p <= c.normal)   return 'normal';
    if (p <= c.leve)     return 'leve';
    if (p <= c.moderado) return 'moderado';
    if (p <= c.severo)   return 'severo';
    return 'extremadamente_severo';
  }

  /**
   * Delta entre pretest y postest. Útil para la pantalla de resultados.
   */
  static calcularDelta(
    inicial: DASS21Response,
    final: DASS21Response
  ): {
    depresion: number;
    ansiedad: number;
    estres: number;
    total: number;
  } {
    return {
      depresion: final.subescalas.depresion - inicial.subescalas.depresion,
      ansiedad:  final.subescalas.ansiedad  - inicial.subescalas.ansiedad,
      estres:    final.subescalas.estres    - inicial.subescalas.estres,
      total:     final.puntuacionTotal      - inicial.puntuacionTotal,
    };
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      emailInstitucional: this.emailInstitucional,
      tipo: this.tipo,
      respuestas: this.respuestas,
      fecha: this.fecha.toISOString(),
      completado: this.completado,
      puntuacionTotal: this.puntuacionTotal,
      subescalas: this.subescalas,
    };
  }

  static fromJSON(data: any): DASS21Response {
    return new DASS21Response({
      ...data,
      fecha: new Date(data.fecha),
    });
  }
}