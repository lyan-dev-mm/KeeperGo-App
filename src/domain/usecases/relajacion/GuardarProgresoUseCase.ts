
import { SesionRelajacion } from '../../entities/relajacion/SesionRelajacion';
import { IRelajacionRepository } from '../../interfaces/IRelajacionRepository';

export class GuardarProgresoUseCase {
  constructor(private repository: IRelajacionRepository) {}

  async execute(sesion: Omit<SesionRelajacion, 'id'>): Promise<SesionRelajacion> {
    return await this.repository.guardarSesion(sesion);
  }
}