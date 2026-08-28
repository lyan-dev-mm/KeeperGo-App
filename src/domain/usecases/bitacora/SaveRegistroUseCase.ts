import { RegistroAnimo } from '../../entities/bitacora/RegistroAnimo';
import { IRegistroRepository } from '../../interfaces/IRegistroRepository';

/**
 * Datos necesarios para crear/actualizar un registro de ánimo
 */
export interface SaveRegistroData {
  id?: string;
  userId: string;
  fecha?: Date;
  emocion: string;
  emocionLabel?: string;
  color?: string;
  energia: number;
  energiaLabel?: string;
  nota?: string;
  sintomas?: string[];
  actividades?: string[];
  reflection?: string;
  latitud?: number;
  longitud?: number;
}

/**
 * Caso de uso: Guardar un registro de ánimo
 * 
 * Este caso de uso se encarga de crear o actualizar un registro
 * de ánimo en la bitácora emocional.
 */
export class SaveRegistroUseCase {
  private repository: IRegistroRepository;

  constructor(repository: IRegistroRepository) {
    this.repository = repository;
  }

  /**
   * Ejecuta el guardado de un registro de ánimo
   * @param registroData - Datos del registro a guardar
   * @returns Registro guardado
   * @throws {Error} Si faltan datos obligatorios o son inválidos
   */
  async execute(registroData: SaveRegistroData): Promise<RegistroAnimo> {
    console.log(' SaveRegistroUseCase - Datos recibidos:', registroData);

    // Validar userId
    if (!registroData.userId || registroData.userId.trim() === '') {
      throw new Error('El ID del usuario es requerido');
    }

    // Validar emoción
    if (!registroData.emocion || registroData.emocion.trim() === '') {
      throw new Error('La emoción es requerida');
    }

    // Validar energía
    if (!registroData.energia) {
      throw new Error('El nivel de energía es requerido');
    }
    
    if (registroData.energia < 1 || registroData.energia > 10) {
      throw new Error('El nivel de energía debe estar entre 1 y 10');
    }
    
    if (!registroData.id) {
      registroData.id = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log('ID generado en UseCase:', registroData.id);
    }
    
    const fecha = registroData.fecha || new Date();

     const props = {
      id: registroData.id,
      userId: registroData.userId,
      fecha: fecha, 
      emocion: registroData.emocion,
      emocionLabel: registroData.emocionLabel || '',
      color: registroData.color || '#9CA3AF',
      energia: registroData.energia,
      energiaLabel: registroData.energiaLabel || '',
      nota: registroData.nota || '',
      sintomas: registroData.sintomas || [],
      actividades: registroData.actividades || [],
      reflection: registroData.reflection || '',
      latitud: registroData.latitud,
      longitud: registroData.longitud,
    };

    const registro = new RegistroAnimo(props);

    if (!registro.isValid()) {
      console.error('Registro inválido:', registro);
      throw new Error('El registro no es válido. Verifica los datos obligatorios.');
    }

    try {
      // Guardar el registro (el repositorio devuelve el registro guardado)
      const saved = await this.repository.saveRegistro(registro);
      
      console.log('Registro guardado exitosamente:', saved.id);
      
      // Si el repositorio devuelve un objeto plano, convertirlo a RegistroAnimo
      if (saved instanceof RegistroAnimo) {
        return saved;
      }
      
      return RegistroAnimo.fromJSON(saved);
      
    } catch (error) {
      console.error(' Error en SaveRegistroUseCase:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Error al guardar el registro');
    }
  }
}

export default SaveRegistroUseCase;