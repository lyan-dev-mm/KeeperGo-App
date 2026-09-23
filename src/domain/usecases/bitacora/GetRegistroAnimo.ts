// src/domain/usecases/bitacora/GetRegistroAnimo.ts

import { RegistroAnimo } from '../../entities/bitacora/RegistroAnimo';
import { IRegistroRepository } from '../../interfaces/IRegistroRepository';

/**
 * Caso de uso: Obtener todos los registros de un usuario
 * 
 * Este caso de uso se encarga de recuperar todos los registros
 * de ánimo de un usuario específico.
 */
export class GetRegistrosUseCase {
  private repository: IRegistroRepository;

  constructor(repository: IRegistroRepository) {
    this.repository = repository;
  }

  /**
   * Ejecuta la obtención de todos los registros de un usuario
   * @param userId - ID del usuario
   * @returns Lista de registros de ánimo (siempre un array)
   * @throws {Error} Si el userId no es válido
   */
  async execute(userId: string): Promise<RegistroAnimo[]> {
    // 1. Validar que el userId no esté vacío
    if (!userId || userId.trim() === '') {
      throw new Error('El ID del usuario es requerido');
    }

    try {
      // 2. Obtener los registros del repositorio
      const registros = await this.repository.getRegistros(userId);
      
      // 3. Siempre retornar un array (incluso si es vacío)
      if (!registros || registros.length === 0) {
        return [];
      }

      // 4. Convertir a instancias de RegistroAnimo
      const result = registros.map((r) => {
        if (r instanceof RegistroAnimo) {
          return r;
        }
        // Si es un objeto plano, convertirlo usando fromJSON
        return RegistroAnimo.fromJSON(r);
      });

      // Filtrar posibles valores null/undefined por seguridad
      return result.filter((r): r is RegistroAnimo => r !== null && r !== undefined);
      
    } catch (error) {
      console.error('Error en GetRegistrosUseCase:', error);
      
      // En caso de error, devolver array vacío (mejor que lanzar excepción)
      // Esto evita que el store se rompa y la UI muestre error
      return [];
    }
  }
}

export default GetRegistrosUseCase;