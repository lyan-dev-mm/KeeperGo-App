import { IRegistroRepository } from '../../domain/interfaces/IRegistroRepository';
import { RegistroAnimo } from '../../domain/entities/bitacora/RegistroAnimo';
import SecureStorage from '../../services/secureStorage.js';

const STORAGE_KEY = 'keepergo_bitacora_registros';

interface StoredRegistro {
  id: string;
  userId: string;
  fecha: string;        
  emocion: string;
  emocionLabel?: string;
  color?: string;
  energia: number;
  energiaLabel?: string;
  nota?: string;
  sintomas?: string[];
  actividades?: string[];
  createdAt?: string;   
  updatedAt?: string;   
  reflection?: string;
  latitud?: number;
  longitud?: number;
}

/**
 * CONVIERTE los datos del storage a los props que espera RegistroAnimo
 */
const mapStoredToRegistroProps = (data: StoredRegistro): any => {
  return {
    ...data,
    // Convertir strings a Date
    fecha: new Date(data.fecha),
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
  };
};

/**
 * CONVIERTE un RegistroAnimo a StoredRegistro (para guardar)
 */
const mapRegistroToStored = (registro: RegistroAnimo): StoredRegistro => {
  const json = registro.toJSON();
  return {
    ...json,
    // Asegurar que las fechas sean strings ISO
    fecha: typeof json.fecha === 'string' ? json.fecha : new Date(json.fecha).toISOString(),
    createdAt: typeof json.createdAt === 'string' ? json.createdAt : new Date(json.createdAt).toISOString(),
    updatedAt: typeof json.updatedAt === 'string' ? json.updatedAt : new Date(json.updatedAt).toISOString(),
  };
};

/**
 * Implementación del repositorio de registros de ánimo
 * Guarda los datos en SecureStorage (local)
 */
export class RegistroAnimoRepositoryImpl implements IRegistroRepository {
  private storage = SecureStorage;

  /**
   * Obtiene los registros de un usuario
   */
  async getRegistros(userId: string): Promise<RegistroAnimo[]> {
    try {
      const rawData = await this.storage.getItem(STORAGE_KEY);
      
      if (!rawData) {
        return [];
      }

      let allRegistros: StoredRegistro[] = [];
      
      if (typeof rawData === 'string') {
        try {
          allRegistros = JSON.parse(rawData);
        } catch (parseError) {
          console.error('Error parseando datos:', parseError);
          return [];
        }
      } else if (Array.isArray(rawData)) {
        allRegistros = rawData;
      } else {
        return [];
      }

      const filtrados = userId 
        ? allRegistros.filter((r) => r.userId === userId) 
        : allRegistros;

      // Convertir cada StoredRegistro a RegistroAnimo
      return filtrados.map((data) => {
        const props = mapStoredToRegistroProps(data);
        return new RegistroAnimo(props);
      });
    } catch (error) {
      console.error('Error en getRegistros:', error);
      return [];
    }
  }

  async getRegistroById(id: string): Promise<RegistroAnimo | null> {
    try {
      const rawData = await this.storage.getItem(STORAGE_KEY);
      if (!rawData) return null;

      let allRegistros: StoredRegistro[] = [];
      if (typeof rawData === 'string') {
        allRegistros = JSON.parse(rawData);
      } else if (Array.isArray(rawData)) {
        allRegistros = rawData;
      } else {
        return null;
      }

      const data = allRegistros.find((r) => r.id === id);
      
      if (!data) return null;
      
      // Convertir StoredRegistro a props de RegistroAnimo
      const props = mapStoredToRegistroProps(data);
      return new RegistroAnimo(props);
    } catch (error) {
      console.error('Error en getRegistroById:', error);
      return null;
    }
  }

  async saveRegistro(registro: RegistroAnimo): Promise<RegistroAnimo> {
    try {
      if (!registro.id) {
        registro.id = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }

      const rawData = await this.storage.getItem(STORAGE_KEY);
      
      let allRegistros: StoredRegistro[] = [];
      
      if (rawData) {
        if (typeof rawData === 'string') {
          try {
            allRegistros = JSON.parse(rawData);
          } catch {
            allRegistros = [];
          }
        } else if (Array.isArray(rawData)) {
          allRegistros = rawData;
        }
      }

      // Normalizar fecha para comparación
      const fechaNormalizada = new Date(registro.fecha);
      fechaNormalizada.setHours(0, 0, 0, 0);

      // Buscar si ya existe un registro para este usuario en esta fecha
      const existingIndex = allRegistros.findIndex((r: StoredRegistro) => {
        if (!r || !r.fecha) return false;
        
        try {
          const rDate = new Date(r.fecha);
          if (isNaN(rDate.getTime())) return false;
          rDate.setHours(0, 0, 0, 0);
          return rDate.getTime() === fechaNormalizada.getTime() && r.userId === registro.userId;
        } catch {
          return false;
        }
      });

      // Convertir RegistroAnimo a StoredRegistro (con strings)
      const registroData = mapRegistroToStored(registro);
      registroData.updatedAt = new Date().toISOString();

      if (existingIndex !== -1) {
        allRegistros[existingIndex] = registroData;
      } else {
        allRegistros.push({
          ...registroData,
          createdAt: new Date().toISOString(),
        });
      }

      await this.storage.setItem(STORAGE_KEY, JSON.stringify(allRegistros));
      return registro;
    } catch (error) {
      console.error('Error en saveRegistro:', error);
      throw new Error('No se pudo guardar el registro');
    }
  }

  async deleteRegistro(id: string): Promise<boolean> {
    try {
      const rawData = await this.storage.getItem(STORAGE_KEY);
      if (!rawData) return false;

      let allRegistros: StoredRegistro[] = [];
      if (typeof rawData === 'string') {
        allRegistros = JSON.parse(rawData);
      } else if (Array.isArray(rawData)) {
        allRegistros = rawData;
      } else {
        return false;
      }

      const filtered = allRegistros.filter((r) => r.id !== id);
      
      if (filtered.length === allRegistros.length) {
        return false;
      }

      await this.storage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error en deleteRegistro:', error);
      throw new Error('No se pudo eliminar el registro');
    }
  }

  async getRegistrosPorFecha(
    userId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<RegistroAnimo[]> {
    const registros = await this.getRegistros(userId);
    return registros.filter((r) => {
      const fecha = new Date(r.fecha);
      return fecha >= fechaInicio && fecha <= fechaFin;
    });
  }

  async getRegistrosPorMes(userId: string, year: number, month: number): Promise<RegistroAnimo[]> {
    const registros = await this.getRegistros(userId);
    return registros.filter((r) => {
      const fecha = new Date(r.fecha);
      return fecha.getFullYear() === year && fecha.getMonth() === month;
    });
  }

  async getRegistroPorFecha(userId: string, fecha: Date): Promise<RegistroAnimo | null> {
    const registros = await this.getRegistros(userId);
    const targetDate = new Date(fecha);
    targetDate.setHours(0, 0, 0, 0);

    const encontrado = registros.find((r) => {
      const rDate = new Date(r.fecha);
      rDate.setHours(0, 0, 0, 0);
      return rDate.getTime() === targetDate.getTime();
    });
    
    return encontrado || null;
  }

  async deleteAllRegistros(userId: string): Promise<boolean> {
    try {
      const rawData = await this.storage.getItem(STORAGE_KEY);
      if (!rawData) return false;

      let allRegistros: StoredRegistro[] = [];
      if (typeof rawData === 'string') {
        allRegistros = JSON.parse(rawData);
      } else if (Array.isArray(rawData)) {
        allRegistros = rawData;
      } else {
        return false;
      }

      const filtered = allRegistros.filter((r) => r.userId !== userId);
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error en deleteAllRegistros:', error);
      throw new Error('No se pudieron eliminar los registros');
    }
  }

  async syncRegistros(userId: string): Promise<{ sincronizados: number; errores: number }> {
    // TODO: Implementar sincronización con Firebase
    return { sincronizados: 0, errores: 0 };
  }
}

export default RegistroAnimoRepositoryImpl;