import AsyncStorage from '@react-native-async-storage/async-storage';
import { EjercicioRespiración, SesionRelajacion } from '../../../domain/entities/relajacion/EjercicioRespiracion';
import { IRelajacionRepository } from '../../../domain/interfaces/IRelajacionRepository';

const STORAGE_KEY_EJERCICIOS = '@relajacion_ejercicios';
const STORAGE_KEY_SESIONES = '@relajacion_sesiones';

export class RelajacionRepositoryImpl implements IRelajacionRepository {
  
  async getEjercicios(): Promise<EjercicioRespiración[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_EJERCICIOS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getEjercicios:', error);
      return [];
    }
  }

  async guardarEjercicios(ejercicios: EjercicioRespiración[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_EJERCICIOS, JSON.stringify(ejercicios));
    } catch (error) {
      console.error('Error guardarEjercicios:', error);
    }
  }

  async getSesiones(): Promise<SesionRelajacion[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_SESIONES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getSesiones:', error);
      return [];
    }
  }

  async guardarSesion(sesion: Omit<SesionRelajacion, 'id'>): Promise<SesionRelajacion> {
    try {
      const sesiones = await this.getSesiones();
      const nuevaSesion: SesionRelajacion = {
        ...sesion,
        id: `sesion_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };
      sesiones.push(nuevaSesion);
      await AsyncStorage.setItem(STORAGE_KEY_SESIONES, JSON.stringify(sesiones));
      return nuevaSesion;
    } catch (error) {
      console.error('Error guardarSesion:', error);
      throw error;
    }
  }
}