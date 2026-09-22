// src/domain/usecases/bitacora/DeleteRegistroUseCase.ts

import { IRegistroRepository } from '../../interfaces/IRegistroRepository';

/**
 * Caso de uso: Eliminar un registro de ánimo
 * 
 * Este caso de uso se encarga de eliminar un registro de ánimo
 * de la bitácora emocional.
 */
export class DeleteRegistroUseCase {
  private repository: IRegistroRepository;

  constructor(repository: IRegistroRepository) {
    this.repository = repository;
  }

  /**
   * Ejecuta la eliminación de un registro
   * @param id - ID del registro a eliminar
   * @param userId - ID del usuario propietario del registro
   * @returns True si se eliminó correctamente
   * @throws Error si el ID no es válido o el registro no existe
   */
  async execute(id: string, userId: string): Promise<boolean> {
    if (!id || id.trim() === '') {
      throw new Error('El ID del registro es requerido');
    }

    if (!userId || userId.trim() === '') {
      throw new Error('El ID del usuario es requerido');
    }

    try {
      const registro = await this.repository.getRegistroById(id, userId);
      
      if (!registro) {
        throw new Error(`Registro con id ${id} no encontrado para el usuario ${userId}`);
      }

      return await this.repository.deleteRegistro(id, userId);
    } catch (error) {
      console.error('Error en DeleteRegistroUseCase:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Error al eliminar el registro');
    }
  }
}

export default DeleteRegistroUseCase;