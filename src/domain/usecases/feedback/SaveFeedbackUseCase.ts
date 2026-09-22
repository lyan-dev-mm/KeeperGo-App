// src/domain/usecases/feedback/SaveFeedbackUseCase.ts

import { FeedbackResponse } from '../../entities/feedback/FeedbackResponse';
import { IFeedbackRepository } from '../../interfaces/IFeedbackRepository';
import { MODULOS_OPCIONES, ModuloId } from '../../../../constants/feedbackQuestions';

export interface SaveFeedbackData {
  userId: string;
  emailInstitucional: string;
  nps: number; // 1-5
  moduloFavorito: ModuloId;
  moduloMasUtil: ModuloId;
  mascotaMotivadora: boolean;
  comentarioMejora?: string | null;
}

export class SaveFeedbackUseCase {
  constructor(private repository: IFeedbackRepository) {}

  async execute(data: SaveFeedbackData): Promise<FeedbackResponse> {
    if (data.nps < 1 || data.nps > 5) {
      throw new Error('El NPS debe estar entre 1 y 5');
    }

    const idsValidos = MODULOS_OPCIONES.map((m) => m.id);
    if (!idsValidos.includes(data.moduloFavorito)) {
      throw new Error('Módulo favorito inválido');
    }
    if (!idsValidos.includes(data.moduloMasUtil)) {
      throw new Error('Módulo más útil inválido');
    }

    const response = new FeedbackResponse({
      userId: data.userId,
      emailInstitucional: data.emailInstitucional,
      nps: data.nps,
      moduloFavorito: data.moduloFavorito,
      moduloMasUtil: data.moduloMasUtil,
      mascotaMotivadora: data.mascotaMotivadora,
      comentarioMejora: data.comentarioMejora ?? null,
      fecha: new Date(),
      completado: true,
    });

    return await this.repository.saveResponse(response);
  }
}