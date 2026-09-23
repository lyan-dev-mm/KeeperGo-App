// src/data/repositories/RegistroAnimoRepositoryImpl.ts

import { IRegistroRepository } from '../../domain/interfaces/IRegistroRepository';
import { RegistroAnimo } from '../../domain/entities/bitacora/RegistroAnimo';
import SecureStorage from '../../services/secureStorage.js';
import { db } from '../../infrastructure/firebase/firebaseConfig';
import { collection, doc, setDoc, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';

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
  latitud?: number | null;
  longitud?: number | null;
}

interface CacheEntry {
  data: RegistroAnimo[];
  timestamp: number;
  userId: string;
}

const mapStoredToRegistroProps = (data: StoredRegistro): any => {
  return {
    ...data,
    fecha: new Date(data.fecha),
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
  };
};

const mapRegistroToStored = (registro: RegistroAnimo): StoredRegistro => {
  const json = registro.toJSON();
  return {
    ...json,
    fecha: typeof json.fecha === 'string' ? json.fecha : new Date(json.fecha).toISOString(),
    createdAt: typeof json.createdAt === 'string' ? json.createdAt : new Date(json.createdAt).toISOString(),
    updatedAt: typeof json.updatedAt === 'string' ? json.updatedAt : new Date(json.updatedAt).toISOString(),
  };
};

export class RegistroAnimoRepositoryImpl implements IRegistroRepository {
  private storage = SecureStorage;
  
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 60000;

  private getCacheKey(userId: string): string {
    return `user_${userId}`;
  }

  private isCacheValid(userId: string): boolean {
    const key = this.getCacheKey(userId);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    const now = Date.now();
    const age = now - entry.timestamp;
    return age < this.CACHE_DURATION;
  }

  private updateCache(userId: string, registros: RegistroAnimo[]): void {
    const key = this.getCacheKey(userId);
    this.cache.set(key, {
      data: registros,
      timestamp: Date.now(),
      userId: userId,
    });
    console.log(`[Cache] Actualizado para usuario ${userId}: ${registros.length} registros`);
  }

  private clearCache(userId?: string): void {
    if (userId) {
      const key = this.getCacheKey(userId);
      this.cache.delete(key);
      console.log(`[Cache] Limpiado para usuario ${userId}`);
    } else {
      this.cache.clear();
      console.log('[Cache] Limpiado completamente');
    }
  }

  private getUserRegistrosCollection(userId: string) {
    return collection(db, 'users', userId, 'registrosEmocionales');
  }

  private getRegistroDoc(userId: string, registroId: string) {
    return doc(db, 'users', userId, 'registrosEmocionales', registroId);
  }

  // ✅ NUEVO: Limpiar campos undefined
  private cleanUndefinedFields(obj: any): any {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined && obj[key] !== null) {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
          cleaned[key] = this.cleanUndefinedFields(obj[key]);
        } else {
          cleaned[key] = obj[key];
        }
      }
    }
    return cleaned;
  }

  // ✅ ACTUALIZADO: Limpiar undefined antes de enviar
  private async syncToFirestore(registro: StoredRegistro): Promise<void> {
    try {
      const cleanData = this.cleanUndefinedFields(registro);
      const docRef = this.getRegistroDoc(registro.userId, registro.id);
      await setDoc(docRef, cleanData);
      console.log(`[Sync] Registro ${registro.id} sincronizado con Firestore`);
    } catch (error) {
      console.error(`[Sync] Error sincronizando registro ${registro.id}:`, error);
    }
  }

  private async loadFromFirestore(userId: string): Promise<RegistroAnimo[]> {
    try {
      const registrosRef = this.getUserRegistrosCollection(userId);
      const querySnapshot = await getDocs(registrosRef);
      
      const registros: RegistroAnimo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as StoredRegistro;
        const props = mapStoredToRegistroProps(data);
        registros.push(new RegistroAnimo(props));
      });

      console.log(`[Sync] ${registros.length} registros cargados desde Firestore`);
      return registros;
    } catch (error) {
      console.error('[Sync] Error cargando desde Firestore:', error);
      return [];
    }
  }

  private mergeRegistros(
    locales: RegistroAnimo[],
    remotos: RegistroAnimo[]
  ): RegistroAnimo[] {
    const mapa = new Map<string, RegistroAnimo>();
    
    for (const reg of locales) {
      mapa.set(reg.id, reg);
    }
    
    for (const reg of remotos) {
      const existente = mapa.get(reg.id);
      if (!existente || reg.updatedAt > existente.updatedAt) {
        mapa.set(reg.id, reg);
      }
    }
    
    return Array.from(mapa.values());
  }

  async getRegistros(userId: string): Promise<RegistroAnimo[]> {
    try {
      if (this.isCacheValid(userId)) {
        const key = this.getCacheKey(userId);
        const entry = this.cache.get(key);
        console.log(`[Cache] Usando cache para usuario ${userId}: ${entry?.data.length || 0} registros`);
        return entry?.data || [];
      }

      console.log(`[Cache] Cache expirado o vacio para usuario ${userId}`);

      const rawData = await this.storage.getItem(STORAGE_KEY);
      let locales: RegistroAnimo[] = [];
      
      if (rawData) {
        let allRegistros: StoredRegistro[] = [];
        if (typeof rawData === 'string') {
          try {
            allRegistros = JSON.parse(rawData);
          } catch (parseError) {
            console.error('Error parseando datos:', parseError);
          }
        } else if (Array.isArray(rawData)) {
          allRegistros = rawData;
        }
        
        const filtrados = allRegistros.filter((r) => r.userId === userId);
        locales = filtrados.map((data) => {
          const props = mapStoredToRegistroProps(data);
          return new RegistroAnimo(props);
        });
      }

      const remotos = await this.loadFromFirestore(userId);
      
      const merged = this.mergeRegistros(locales, remotos);
      
      const storedData = merged.map((r) => mapRegistroToStored(r));
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(storedData));

      this.updateCache(userId, merged);
      
      return merged;
    } catch (error) {
      console.error('Error en getRegistros:', error);
      return [];
    }
  }

  async getRegistroById(id: string, userId: string): Promise<RegistroAnimo | null> {
    try {
      const registros = await this.getRegistros(userId);
      const encontrado = registros.find((r) => r.id === id);
      return encontrado || null;
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

      const fechaNormalizada = new Date(registro.fecha);
      fechaNormalizada.setHours(0, 0, 0, 0);

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
      
      await this.syncToFirestore(registroData);
      
      this.clearCache(registro.userId);
      
      return registro;
    } catch (error) {
      console.error('Error en saveRegistro:', error);
      throw new Error('No se pudo guardar el registro');
    }
  }

  async deleteRegistro(id: string, userId: string): Promise<boolean> {
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
      
      try {
        const docRef = this.getRegistroDoc(userId, id);
        await deleteDoc(docRef);
        console.log(`[Sync] Registro ${id} eliminado de Firestore`);
      } catch (error) {
        console.error(`[Sync] Error eliminando registro ${id} de Firestore:`, error);
      }
      
      this.clearCache(userId);
      
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
      
      try {
        const registrosRef = this.getUserRegistrosCollection(userId);
        const querySnapshot = await getDocs(registrosRef);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`[Sync] Todos los registros de ${userId} eliminados de Firestore`);
      } catch (error) {
        console.error(`[Sync] Error eliminando todos los registros de ${userId}:`, error);
      }
      
      this.clearCache(userId);
      
      return true;
    } catch (error) {
      console.error('Error en deleteAllRegistros:', error);
      throw new Error('No se pudieron eliminar los registros');
    }
  }

  async syncRegistros(userId: string): Promise<{ sincronizados: number; errores: number }> {
    console.log(`[Sync] Sincronizacion manual para usuario ${userId}`);
    
    try {
      const registros = await this.getRegistros(userId);
      let sincronizados = 0;
      let errores = 0;

      for (const registro of registros) {
        try {
          const stored = mapRegistroToStored(registro);
          await this.syncToFirestore(stored);
          sincronizados++;
        } catch (error) {
          console.error(`[Sync] Error sincronizando registro ${registro.id}:`, error);
          errores++;
        }
      }

      console.log(`[Sync] Sincronizacion completada. ${sincronizados} exitosos, ${errores} errores`);
      return { sincronizados, errores };
    } catch (error) {
      console.error('[Sync] Error en syncRegistros:', error);
      return { sincronizados: 0, errores: 1 };
    }
  }

  getCacheStats(userId?: string): { size: number; entries: string[] } {
    if (userId) {
      const key = this.getCacheKey(userId);
      const entry = this.cache.get(key);
      if (entry) {
        return {
          size: entry.data.length,
          entries: [userId],
        };
      }
      return { size: 0, entries: [] };
    }
    
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  refreshCache(userId: string): Promise<RegistroAnimo[]> {
    this.clearCache(userId);
    return this.getRegistros(userId);
  }
}

export default RegistroAnimoRepositoryImpl;