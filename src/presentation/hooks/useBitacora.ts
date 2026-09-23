// src/presentation/hooks/useBitacora.ts

import { useBitacoraStore } from '../store/bitacoraStore';

/**
 * Hook de presentación que expone el store de bitácora
 * Sigue los principios de Clean Architecture al ser solo una capa de presentación
 */
export function useBitacora() {
  const store = useBitacoraStore();
  
  return {
    // Estado
    registros: store.registros,
    isLoading: store.isLoading,
    error: store.error,
    alertas: store.alertas,
    resumenAlerta: store.resumenAlerta,
    analisisCompleto: store.analisisCompleto,
    userId: store.userId,
    
    // Acciones
    setUserId: store.setUserId,
    loadRegistros: store.loadRegistros,
    getRegistroPorFecha: store.getRegistroPorFecha,
    saveRegistro: store.saveRegistro,
    deleteRegistro: store.deleteRegistro,
    analizarPatrones: store.analizarPatrones,
    limpiarAlertas: store.limpiarAlertas,
    resetStore: store.resetStore,
  };
}

export default useBitacora;