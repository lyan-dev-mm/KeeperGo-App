// src/domain/usecases/bitacora/DeleteRegistroUseCase.ts

import { RegistroAnimo } from '../../../domain/entities/bitacora/RegistroAnimo';

// ============================================
// INTERFAZ DEL REPOSITORIO
// ============================================
interface IRegistroAnimoRepository {
  getRegistroById(id: string): Promise<RegistroAnimo | null>;
  deleteRegistro(id: string): Promise<boolean>;
}

/**
 * Caso de uso: Eliminar un registro de ánimo
 * 
 * Este caso de uso se encarga de eliminar un registro de ánimo
 * de la bitácora emocional.
 */
export class DeleteRegistroUseCase {
  private repository: IRegistroAnimoRepository;

  constructor(repository: IRegistroAnimoRepository) {
    this.repository = repository;
  }

  /**
   * Ejecuta la eliminación de un registro
   * @param {string} id - ID del registro a eliminar
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   * @throws {Error} - Si el ID no es válido o el registro no existe
   */
  async execute(id: string): Promise<boolean> {
    // 1. Validar que el ID no esté vacío
    if (!id || id.trim() === '') {
      throw new Error('El ID del registro es requerido');
    }

    try {
      // 2. Verificar que el registro existe
      const registro = await this.repository.getRegistroById(id);
      
      if (!registro) {
        throw new Error('Registro no encontrado');
      }

      // 3. Eliminar el registro
      const resultado = await this.repository.deleteRegistro(id);
      
      return resultado;
    } catch (error) {
      // 4. Manejar errores
      console.error('Error en DeleteRegistroUseCase:', error);
      
      if (error instanceof Error) {
        throw error; // Re-lanzar errores conocidos
      }
      
      throw new Error('Error al eliminar el registro');
    }
  }
}

export default DeleteRegistroUseCase;