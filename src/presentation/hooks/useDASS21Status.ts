import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDASS21Store } from '../store/dass21Store';
import { DASS21_CONFIG } from '../../../constants/dass21Config';

export type DASS21Estado =
  | 'loading'
  | 'sin_iniciar'
  | 'inicial_completado'
  | 'listo_final'
  | 'final_completado'
  | 'sin_usuario';

export function useDASS21Status(userId: string | null | undefined) {
  const {
    responses,
    hasCompletedInicial,
    hasCompletedFinal,
    isLoading,
  } = useDASS21Store();

  const [tick, setTick] = useState(0);

  const { estado, diasRestantes } = useMemo<{
    estado: DASS21Estado;
    diasRestantes: number | null;
  }>(() => {
    // `tick` fuerza recálculo cada minuto sin cambiar deps del useMemo.
    void tick;

    if (!userId) return { estado: 'sin_usuario', diasRestantes: null };
    if (isLoading) return { estado: 'loading', diasRestantes: null };
    if (!hasCompletedInicial) return { estado: 'sin_iniciar', diasRestantes: null };
    if (hasCompletedFinal) return { estado: 'final_completado', diasRestantes: null };

    const inicial = responses.find((r) => r.tipo === 'inicial');
    if (!inicial) return { estado: 'sin_iniciar', diasRestantes: null };

    const fechaObjetivo =
      new Date(inicial.fecha).getTime() +
      DASS21_CONFIG.DIAS_ESPERA * DASS21_CONFIG.MS_POR_DIA;
    const diferencia = fechaObjetivo - Date.now();

    if (diferencia <= 0) return { estado: 'listo_final', diasRestantes: 0 };
    return {
      estado: 'inicial_completado',
      diasRestantes: Math.ceil(diferencia / DASS21_CONFIG.MS_POR_DIA),
    };
  }, [userId, isLoading, hasCompletedInicial, hasCompletedFinal, responses, tick]);

  // Recalcular cada minuto para actualizar días restantes.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  return { estado, diasRestantes, hasCompletedInicial, hasCompletedFinal, isLoading };
}