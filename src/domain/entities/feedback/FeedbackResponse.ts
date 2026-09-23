// src/domain/entities/feedback/FeedbackResponse.ts

import { FEEDBACK_CONFIG } from '../../../../constants/surveyConfig';
import { ModuloId } from '../../../../constants/feedbackQuestions';

export type NPSCategoria = 'detractor' | 'pasivo' | 'promotor';

export interface FeedbackResponseProps {
  id?: string;
  userId: string;
  emailInstitucional: string;
  /** 0-10 */
  nps: number;
  moduloFavorito: ModuloId;
  moduloMasUtil: ModuloId;
  mascotaMotivadora: boolean;
  comentarioMejora?: string | null;
  fecha: Date;
  completado: boolean;
  categoriaNPS?: NPSCategoria;
}

export class FeedbackResponse {
  id: string;
  userId: string;
  emailInstitucional: string;
  nps: number;
  moduloFavorito: ModuloId;
  moduloMasUtil: ModuloId;
  mascotaMotivadora: boolean;
  comentarioMejora: string | null;
  fecha: Date;
  completado: boolean;
  categoriaNPS: NPSCategoria;

  constructor({
    id,
    userId,
    emailInstitucional,
    nps,
    moduloFavorito,
    moduloMasUtil,
    mascotaMotivadora,
    comentarioMejora,
    fecha,
    completado,
    categoriaNPS,
  }: FeedbackResponseProps) {
    this.id = id ?? `feedback_${userId}`;
    this.userId = userId;
    this.emailInstitucional = emailInstitucional;
    this.nps = nps;
    this.moduloFavorito = moduloFavorito;
    this.moduloMasUtil = moduloMasUtil;
    this.mascotaMotivadora = mascotaMotivadora;
    this.comentarioMejora = comentarioMejora ?? null;
    this.fecha = fecha;
    this.completado = completado;
    this.categoriaNPS = categoriaNPS ?? this.calcularCategoriaNPS(nps);
  }

  /**
   * Clasificación estándar NPS:
   * 0-6 → Detractor | 7-8 → Pasivo | 9-10 → Promotor
   */
  private calcularCategoriaNPS(nps: number): NPSCategoria {
    if (nps <= FEEDBACK_CONFIG.NPS_DETRACTOR_MAX) return 'detractor';
    if (nps <= FEEDBACK_CONFIG.NPS_PASIVO_MAX) return 'pasivo';
    return 'promotor';
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      emailInstitucional: this.emailInstitucional,
      nps: this.nps,
      moduloFavorito: this.moduloFavorito,
      moduloMasUtil: this.moduloMasUtil,
      mascotaMotivadora: this.mascotaMotivadora,
      comentarioMejora: this.comentarioMejora,
      fecha: this.fecha.toISOString(),
      completado: this.completado,
      categoriaNPS: this.categoriaNPS,
    };
  }

  static fromJSON(data: any): FeedbackResponse {
    return new FeedbackResponse({
      ...data,
      fecha: new Date(data.fecha),
    });
  }

  /**
   * Cálculo del NPS agregado a partir de una lista de respuestas.
   * Fórmula: %Promotores - %Detractores (rango -100 a +100).
   * Este cálculo se hace a nivel de análisis, no de usuario individual.
   */
  static calcularNPSAgregado(responses: FeedbackResponse[]): number {
    if (responses.length === 0) return 0;

    const total = responses.length;
    const promotores = responses.filter((r) => r.categoriaNPS === 'promotor').length;
    const detractores = responses.filter((r) => r.categoriaNPS === 'detractor').length;

    return ((promotores - detractores) / total) * 100;
  }
}