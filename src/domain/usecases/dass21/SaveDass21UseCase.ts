
import { DASS21Response, DASS21Tipo } from '../../entities/dass21/DASS21Response';
import { IDASS21Repository } from '../../interfaces/IDass21Repository';

export interface SaveDASS21Data {
  userId: string;
  emailInstitucional: string;
  tipo: DASS21Tipo;
  respuestas: number[];
}

export class SaveDASS21UseCase {
  constructor(private repository: IDASS21Repository) {}

  async execute(data: SaveDASS21Data): Promise<DASS21Response> {
    // Validar que todas las respuestas estén completas
    if (data.respuestas.length !== 21) {
      throw new Error('El cuestionario debe tener 21 respuestas');
    }

    if (data.respuestas.some((r) => r < 0 || r > 3)) {
      throw new Error('Las respuestas deben estar entre 0 y 3');
    }

    const response = new DASS21Response({
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