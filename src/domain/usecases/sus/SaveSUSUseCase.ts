// src/domain/usecases/sus/SaveSUSUseCase.ts

import { SUSResponse } from '../../entities/sus/SUSResponse';
import { ISUSRepository } from '../../interfaces/ISUSRepository';
import { SUS_CONFIG } from '../../../../constants/surveyConfig';

export interface SaveSUSData {
  userId: string;
  emailInstitucional: string;
  respuestas: number[];
}

export class SaveSUSUseCase {
  constructor(private repository: ISUSRepository) {}

  async execute(data: SaveSUSData): Promise<SUSResponse> {
    if (data.respuestas.length !== SUS_CONFIG.TOTAL_ITEMS) {
      throw new Error(`El SUS requiere ${SUS_CONFIG.TOTAL_ITEMS} respuestas`);
    }

    if (
      data.respuestas.some(
        (r) => r < SUS_CONFIG.ESCALA_MIN || r > SUS_CONFIG.ESCALA_MAX
      )
    ) {
      throw new Error(
        `Las respuestas deben estar entre ${SUS_CONFIG.ESCALA_MIN} y ${SUS_CONFIG.ESCALA_MAX}`
      );
    }

    const response = new SUSResponse({
      userId: data.userId,
      emailInstitucional: data.emailInstitucional,
      respuestas: data.respuestas,
      fecha: new Date(),
      completado: true,
    });

    return await this.repository.saveResponse(response);
  }
}