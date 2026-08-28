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
   * @returns Lista de registros de ánimo
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
      
      // 3. Retornar los registros (ya vienen como RegistroAnimo del repositorio)
      // Nota: El repositorio ya debería devolver instancias de RegistroAnimo,
      // pero por si acaso, verificamos y convertimos si es necesario
      if (!registros || registros.length === 0) {
        return [];
      }

      // Si los registros ya son instancias de RegistroAnimo, retornarlos directamente
      // Si son objetos planos, convertirlos
      return registros.map((r) => {
        if (r instanceof RegistroAnimo) {
          return r;
        }
        // Si es un objeto plano, convertirlo usando fromJSON
        return RegistroAnimo.fromJSON(r);
      });
      
    } catch (error) {
      console.error('Error en GetRegistrosUseCase:', error);
      
      if (error instanceof Error) {
        throw error; // Re-lanzar errores conocidos
      }
      
      throw new Error('Error al obtener los registros');
    }
  }
}

export default GetRegistrosUseCase;