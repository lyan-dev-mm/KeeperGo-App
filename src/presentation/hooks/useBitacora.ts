// src/presentation/hooks/useBitacora.ts
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { RegistroAnimoRepositoryImpl } from '../../data/repositories/RegistroAnimoRepositoryImpl';
import { GetRegistrosUseCase } from '../../domain/usecases/bitacora/GetRegistroAnimo';
import { GetRegistroPorFechaUseCase } from '../../domain/usecases/bitacora/GetRegistroPorFechaUseCase';
import { SaveRegistroUseCase, SaveRegistroData } from '../../domain/usecases/bitacora/SaveRegistroUseCase';
import { DeleteRegistroUseCase } from '../../domain/usecases/bitacora/DeleteRegistroUseCase';
import { 
  DetectarPatronesUseCase,
  AnalisisCompleto,
  Alerta 
} from '../../domain/usecases/bitacora/DetectarPatronesUseCase';
import { RegistroAnimo } from '../../domain/entities/bitacora/RegistroAnimo';

export interface UseBitacoraReturn {
  // Estado
  registros: RegistroAnimo[];
  isLoading: boolean;
  error: string | null;
  alertas: Alerta[];
  resumenAlerta: string;
  analisisCompleto: AnalisisCompleto | null;
  onAlertasChange?: (alertas: Alerta[]) => void;
  
  // Acciones
  loadRegistros: () => Promise<void>;
  getRegistroPorFecha: (fecha: Date) => RegistroAnimo | null;
  saveRegistro: (registroData: Omit<SaveRegistroData, 'userId'>) => Promise<RegistroAnimo | null>;
  deleteRegistro: (id: string) => Promise<boolean>;
  
  // Análisis de patrones
  analizarPatrones: (registro: RegistroAnimo) => Promise<AnalisisCompleto | null>;
  limpiarAlertas: () => void;
}

/**
 * - Dominio: Use Cases (GetRegistrosUseCase, DetectarPatronesUseCase, etc.)
 * - Datos: Repository (RegistroAnimoRepositoryImpl)
 * 
 * @param userId - ID del usuario (por defecto 'temp_user')
 * @returns Estado y funciones de la bitácora
 */
export function useBitacora(userId: string = 'temp_user', onAlertasChange?: (alertas: Alerta[]) => void): UseBitacoraReturn {
  
  // ESTADO  
  const [registros, setRegistros] = useState<RegistroAnimo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [resumenAlerta, setResumenAlerta] = useState<string>('');
  const [analisisCompleto, setAnalisisCompleto] = useState<AnalisisCompleto | null>(null);

  // INICIALIZAR REPOSITORIO Y USE CASES
  
  const repository = new RegistroAnimoRepositoryImpl();
  const getRegistrosUseCase = new GetRegistrosUseCase(repository);
  const saveRegistroUseCase = new SaveRegistroUseCase(repository);
  const deleteRegistroUseCase = new DeleteRegistroUseCase(repository);
  const detectarPatronesUseCase = new DetectarPatronesUseCase(repository);

  // CARGAR REGISTROS
  
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

  // OBTENER REGISTRO POR FECHA
  
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

  // ANÁLISIS DE PATRONES 
  
  const analizarPatrones = useCallback(async (
    registro: RegistroAnimo
  ): Promise<AnalisisCompleto | null> => {
    console.log(' useBitacora.analizarPatrones - Iniciando análisis...');
    
    try {
      // Obtener historial completo desde el repositorio
      const historial = await repository.getRegistros(userId);
      console.log(`Historial obtenido: ${historial.length} registros`);
      
      // Ejecutar el Use Case de dominio
      const resultado = await detectarPatronesUseCase.execute(
        userId,
        registro,
        historial
      );

      console.log(`Análisis completado. Alertas: ${resultado.alertas.length}`);
      
      
      // Actualizar estado de la presentación
      setAlertas(resultado.alertas);
      setResumenAlerta(resultado.resumen);
      setAnalisisCompleto(resultado);

      console.log('📊 Estado alertas actualizado en hook:', resultado.alertas.length);
      
      if (onAlertasChange) {
        console.log('📢 Notificando a la screen con', resultado.alertas.length, 'alertas');
        onAlertasChange(resultado.alertas);
      }
      
      return resultado;
    } catch (error) {
      console.error('Error en analizarPatrones:', error);
      return null;
    }
  }, [userId]);

  const limpiarAlertas = useCallback((): void => {
    console.log('🧹 Limpiando alertas');
    setAlertas([]);
    setResumenAlerta('');
    setAnalisisCompleto(null);
  }, []);

  const saveRegistro = useCallback(async (
    registroData: Omit<SaveRegistroData, 'userId'>
  ): Promise<RegistroAnimo | null> => {
    console.log(' useBitacora.saveRegistro - Datos recibidos:', registroData);

    setIsLoading(true);
    setError(null);

    try {
      // 1. Preparar datos con userId
      const data: SaveRegistroData = {
        ...registroData,
        userId: userId || 'temp_user',
      };
      
      console.log(' Datos a enviar al UseCase:', data);

      const saved = await saveRegistroUseCase.execute(data);
    
      await loadRegistros();
      
      if (saved) {
        console.log('Analizando patrones para el nuevo registro...');
        await analizarPatrones(saved);
      }
      
      return saved;
    } catch (err) {
      console.error('Error en saveRegistro:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar el registro';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadRegistros, analizarPatrones]);

  
  const deleteRegistro = useCallback(async (id: string): Promise<boolean> => {
    console.log(' deleteRegistro llamado con id:', id);

    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteRegistroUseCase.execute(id);
      console.log('deleteRegistroUseCase.execute result:', result);
      
      if (result) {
        await loadRegistros();
        // Limpiar alertas si se elimina un registro
        limpiarAlertas();
      }
      return result;
    } catch (err) {
      console.error(' Error en deleteRegistro:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el registro';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadRegistros, limpiarAlertas]);
  
  useEffect(() => {
    if (userId) {
      loadRegistros();
    }
  }, [userId]);

  // Recargar al enfocar
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadRegistros();
      }
    }, [userId])
  );

  return {
    // Estado
    registros,
    isLoading,
    error,
    alertas,
    resumenAlerta,
    analisisCompleto,
    
    // Acciones
    loadRegistros,
    getRegistroPorFecha,
    saveRegistro,
    deleteRegistro,
    
    // Análisis
    analizarPatrones,
    limpiarAlertas,
  };
}

export default useBitacora;