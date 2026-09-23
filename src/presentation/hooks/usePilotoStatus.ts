// src/presentation/hooks/usePilotoStatus.ts

import { useMemo } from 'react';
import { useDASS21Status } from './useDASS21Status';
import { useDASS21Store } from '../store/dass21Store';
import { useAutopercepcionStore } from '../store/autopercepcionStore';
import { useSUSStore } from '../store/susStore';
import { useFeedbackStore } from '../store/feedbackStore';
import { usePaywallStore } from '../store/paywallStore';
import { usePilotoStore } from '../store/pilotoStore';

export type CierreStep =
  | 'no_iniciado'           // Aún no es Día 5
  | 'listo_para_cierre'     // Día 5, aún no inicia el cierre
  | 'en_progreso'           // Inició el cierre, faltan pasos
  | 'completado';           // Terminó todos los instrumentos

export interface CierreProgreso {
  /** ¿Ya completó cada instrumento del cierre? */
  dass21Postest: boolean;
  autopercepcionPostest: boolean;
  sus: boolean;
  feedback: boolean;
  paywall: boolean;
  /** Cuántos van completados de 5 */
  completados: number;
  total: number;
}

export function usePilotoStatus(userId: string | null | undefined) {
  const { estado: dass21Estado, diasRestantes } = useDASS21Status(userId);

  const { hasCompletedFinal: hasDASS21Postest } = useDASS21Store();
  const { hasCompletedPostest } = useAutopercepcionStore();
  const { hasCompleted: hasSUS } = useSUSStore();
  const { hasCompleted: hasFeedback } = useFeedbackStore();
  const { hasCompleted: hasPaywall } = usePaywallStore();
  const { hasCompleted: pilotoCompletado } = usePilotoStore();

  const progreso = useMemo<CierreProgreso>(() => {
    const flags = {
      dass21Postest: hasDASS21Postest,
      autopercepcionPostest: hasCompletedPostest,
      sus: hasSUS,
      feedback: hasFeedback,
      paywall: hasPaywall,
    };

    const completados = Object.values(flags).filter(Boolean).length;

    return {
      ...flags,
      completados,
      total: 5,
    };
  }, [
    hasDASS21Postest,
    hasCompletedPostest,
    hasSUS,
    hasFeedback,
    hasPaywall,
  ]);

  const cierreStep: CierreStep = useMemo(() => {
    if (pilotoCompletado) return 'completado';
    if (dass21Estado !== 'listo_final' && dass21Estado !== 'final_completado') {
      return 'no_iniciado';
    }
    // Ya pasó el día 5 (o ya hizo el postest)
    if (progreso.completados === 0) {
      return 'listo_para_cierre';
    }
    if (progreso.completados < progreso.total) {
      return 'en_progreso';
    }
    return 'completado';
  }, [dass21Estado, progreso, pilotoCompletado]);

  /** Siguiente paso pendiente */
  const siguientePaso = useMemo(() => {
    if (!progreso.dass21Postest) return 'DASS21_POSTEST';
    if (!progreso.autopercepcionPostest) return 'AUTOPERCEPCION_POSTEST';
    if (!progreso.sus) return 'SUS';
    if (!progreso.feedback) return 'FEEDBACK';
    if (!progreso.paywall) return 'PAYWALL';
    return null;
  }, [progreso]);

  return {
    cierreStep,
    progreso,
    siguientePaso,
    diasRestantes,
    /** ¿Debe mostrarse el banner del cierre en Home? */
    debeMostrarBannerCierre:
      cierreStep === 'listo_para_cierre' || cierreStep === 'en_progreso',
    /** ¿Terminó todo el piloto? */
    pilotoCompletado,
  };
}