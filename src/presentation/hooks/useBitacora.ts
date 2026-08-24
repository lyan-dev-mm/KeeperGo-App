// src/presentation/hooks/useBitacora.ts

import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { RegistroAnimoRepositoryImpl } from '../../data/repositories/RegistroAnimoRepositoryImpl';
import { GetRegistrosUseCase } from '../../domain/usecases/bitacora/GetRegistroAnimo';
import { GetRegistroPorFechaUseCase } from '../../domain/usecases/bitacora/GetRegistroPorFechaUseCase';
import { SaveRegistroUseCase, SaveRegistroData } from '../../domain/usecases/bitacora/SaveRegistroUseCase';
import { DeleteRegistroUseCase } from '../../domain/usecases/bitacora/DeleteRegistroUseCase';
import { RegistroAnimo } from '../../domain/entities/bitacora/RegistroAnimo';

// ============================================
// INTERFAZ DEL HOOK
// ============================================

interface UseBitacoraReturn {
  registros: RegistroAnimo[];
  isLoading: boolean;
  error: string | null;
  loadRegistros: () => Promise<void>;
  getRegistroPorFecha: (fecha: Date) => RegistroAnimo | null;
  saveRegistro: (registroData: Omit<SaveRegistroData, 'userId'>) => Promise<RegistroAnimo | null>;
  deleteRegistro: (id: string) => Promise<boolean>;
}

// ============================================
// HOOK
// ============================================

/**
 * Hook para manejar la bitácora emocional
 * 
 * Proporciona funciones para cargar, guardar, eliminar y obtener
 * registros de ánimo de la bitácora.
 * 
 * @param userId - ID del usuario (opcional, por defecto 'temp_user')
 * @returns Objeto con el estado y funciones de la bitácora
 */
export function useBitacora(userId: string = 'temp_user'): UseBitacoraReturn {
  // ============================================
  // ESTADO
  // ============================================
  
  const [registros, setRegistros] = useState<RegistroAnimo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // INICIALIZAR REPOSITORIO Y USE CASES
  // ============================================
  
  const repository = new RegistroAnimoRepositoryImpl();
  const getRegistrosUseCase = new GetRegistrosUseCase(repository);
  const getRegistroPorFechaUseCase = new GetRegistroPorFechaUseCase(repository);
  const saveRegistroUseCase = new SaveRegistroUseCase(repository);
  const deleteRegistroUseCase = new DeleteRegistroUseCase(repository);

  // ============================================
  // CARGAR REGISTROS
  // ============================================
  
  const loadRegistros = useCallback(async (): Promise<void> => {
    if (!userId) {
      setError('Usuario no autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getRegistrosUseCase.execute(userId);
      setRegistros(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los registros';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // ============================================
  // OBTENER REGISTRO POR FECHA
  // ============================================
  
  const getRegistroPorFecha = useCallback((fecha: Date): RegistroAnimo | null => {
    try {
      const targetDate = new Date(fecha);
      targetDate.setHours(0, 0, 0, 0);
      
      const encontrado = registros.find((r) => {
        const rDate = new Date(r.fecha);
        rDate.setHours(0, 0, 0, 0);
        return rDate.getTime() === targetDate.getTime();
      });
      
      return encontrado || null;
    } catch (error) {
      console.error('Error en getRegistroPorFecha:', error);
      return null;
    }
  }, [registros]);

  // ============================================
  // GUARDAR REGISTRO
  // ============================================
  
  const saveRegistro = useCallback(async (
    registroData: Omit<SaveRegistroData, 'userId'>
  ): Promise<RegistroAnimo | null> => {
    console.log('📊 useBitacora.saveRegistro - Datos recibidos:', registroData);

    setIsLoading(true);
    setError(null);

    try {
      // Agregar userId a los datos
      const data: SaveRegistroData = {
        ...registroData,
        userId: userId || 'temp_user',
      };
      
      console.log('📊 Datos a enviar al UseCase:', data);

      const saved = await saveRegistroUseCase.execute(data);
      await loadRegistros(); // Recargar después de guardar
      return saved;
    } catch (err) {
      console.error('❌ Error en saveRegistro:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar el registro';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadRegistros]);

  // ============================================
  // ELIMINAR REGISTRO
  // ============================================
  
  const deleteRegistro = useCallback(async (id: string): Promise<boolean> => {
    console.log('🗑️ deleteRegistro llamado con id:', id);

    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteRegistroUseCase.execute(id);
      console.log('🗑️ deleteRegistroUseCase.execute result:', result);
      
      if (result) {
        await loadRegistros();
      }
      return result;
    } catch (err) {
      console.error('❌ Error en deleteRegistro:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el registro';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadRegistros]);

  // ============================================
  // EFECTOS
  // ============================================
  
  // Cargar al montar
  useEffect(() => {
    if (userId) {
      loadRegistros();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recargar al enfocar
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadRegistros();
      }
    }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ============================================
  // RETORNAR
  // ============================================
  
  return {
    registros,
    isLoading,
    error,
    loadRegistros,
    getRegistroPorFecha,
    saveRegistro,
    deleteRegistro,
  };
}

export default useBitacora;