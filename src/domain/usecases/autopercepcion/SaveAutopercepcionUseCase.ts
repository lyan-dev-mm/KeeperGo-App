// src/domain/usecases/autopercepcion/SaveAutopercepcionUseCase.ts

import {
  AutopercepcionResponse,
  AutopercepcionTipo,
} from '../../entities/autopercepcion/AutopercepcionResponse';
import { IAutopercepcionRepository } from '../../interfaces/IAutopercepcionRepository';
import { AUTOPERCEPCION_CONFIG } from '../../../../constants/surveyConfig';

export interface SaveAutopercepcionData {
  userId: string;
  emailInstitucional: string;
  tipo: AutopercepcionTipo;
  respuestas: number[];
}

export class SaveAutopercepcionUseCase {
  constructor(private repository: IAutopercepcionRepository) {}

  async execute(data: SaveAutopercepcionData): Promise<AutopercepcionResponse> {
    const esperados =
      data.tipo === 'pretest'
        ? AUTOPERCEPCION_CONFIG.TOTAL_ITEMS_PRETEST
        : AUTOPERCEPCION_CONFIG.TOTAL_ITEMS_POSTEST;

    if (data.respuestas.length !== esperados) {
      throw new Error(
        `El cuestionario ${data.tipo} requiere ${esperados} respuestas`
      );
    }

    if (
      data.respuestas.some(
        (r) => r < AUTOPERCEPCION_CONFIG.ESCALA_MIN || r > AUTOPERCEPCION_CONFIG.ESCALA_MAX
      )
    ) {
      throw new Error(
        `Las respuestas deben estar entre ${AUTOPERCEPCION_CONFIG.ESCALA_MIN} y ${AUTOPERCEPCION_CONFIG.ESCALA_MAX}`
      );
    }

    const response = new AutopercepcionResponse({
      userId: data.userId,
      emailInstitucional: data.emailInstitucional,
      tipo: data.tipo,
      respuestas: data.respuestas,
      fecha: new Date(),
      completado: true,
    });

    return await this.repository.saveResponse(response);
  }
}