import { RegistroAnimo } from '../../entities/bitacora/RegistroAnimo';
import { IRegistroRepository } from '../../interfaces/IRegistroRepository';

/**
 * Caso de uso: Obtener un registro de ánimo por fecha específica
 * 
 * Este caso de uso se encarga de recuperar un registro de ánimo
 * de un usuario en una fecha específica.
 */
export class GetRegistroPorFechaUseCase {
  private repository: IRegistroRepository;

  constructor(repository: IRegistroRepository) {
    this.repository = repository;
  }

  /**
   * Ejecuta la obtención del registro de una fecha específica
   * @param userId - ID del usuario
   * @param fecha - Fecha a buscar
   * @returns Registro de ánimo encontrado o null
   * @throws {Error} Si el userId no es válido o la fecha no es válida
   */
  async execute(userId: string, fecha: Date): Promise<RegistroAnimo | null> {
    // 1. Validar que el userId no esté vacío
    if (!userId || userId.trim() === '') {
      throw new Error('El ID del usuario es requerido');
    }

    // 2. Validar que la fecha sea válida
    if (!fecha) {
      throw new Error('La fecha es requerida');
    }

    // Verificar que sea un objeto Date válido
    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
      throw new Error('Fecha inválida');
    }

    try {
      // 3.  Calcular el rango de fechas (todo el día)
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);

      // 4.  Obtener registros en el rango de fechas
      const registros = await this.repository.getRegistrosPorFecha(
        userId,
        fechaInicio,
        fechaFin
      );

      // 5. Si no hay registros, retornar null
      if (!registros || registros.length === 0) {
        return null;
      }

      // 6. Retornar el primer registro (solo debería haber uno)
      const registro = registros[0];

      if (registro instanceof RegistroAnimo) {
        return registro;
      }

      return RegistroAnimo.fromJSON(registro);
      
    } catch (error) {
      console.error('Error en GetRegistroPorFechaUseCase:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Error al obtener el registro de la fecha');
    }
  }
}

export default GetRegistroPorFechaUseCase;