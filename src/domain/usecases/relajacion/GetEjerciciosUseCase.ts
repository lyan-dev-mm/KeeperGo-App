
import { EjercicioRespiración } from '../../entities/relajacion/EjercicioRespiracion';
import { IRelajacionRepository } from '../../interfaces/IRelajacionRepository';

export class GetEjerciciosUseCase {
  constructor(private repository: IRelajacionRepository) {}

  async execute(): Promise<EjercicioRespiración[]> {
    return await this.repository.getEjercicios();
  }
}