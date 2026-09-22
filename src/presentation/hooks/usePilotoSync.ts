// src/presentation/hooks/usePilotoSync.ts

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDASS21Store } from '../store/dass21Store';
import { useSUSStore } from '../store/susStore';
import { useAutopercepcionStore } from '../store/autopercepcionStore';
import { useFeedbackStore } from '../store/feedbackStore';
import { usePaywallStore } from '../store/paywallStore';
import { usePilotoStore } from '../store/pilotoStore';

/**
 * Sincroniza el estado de TODOS los instrumentos del piloto
 * con el usuario autenticado. Montar UNA SOLA VEZ en el layout raíz.
 */
export function usePilotoSync() {
  const { user, isInitializing } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  // DASS-21
  const { setUserId: setDass21UserId, refresh: refreshDass21, reset: resetDass21 } = useDASS21Store();
  // SUS
  const { setUserId: setSusUserId, refresh: refreshSus, reset: resetSus } = useSUSStore();
  // Autopercepción
  const { setUserId: setAutoUserId, refresh: refreshAuto, reset: resetAuto } = useAutopercepcionStore();
  // Feedback
  const { setUserId: setFeedbackUserId, refresh: refreshFeedback, reset: resetFeedback } = useFeedbackStore();
  // Paywall
  const { setUserId: setPaywallUserId, refresh: refreshPaywall, reset: resetPaywall } = usePaywallStore();
  // Piloto
  const { setUserId: setPilotoUserId, refresh: refreshPiloto, reset: resetPiloto } = usePilotoStore();

  useEffect(() => {
    if (isInitializing) return;

    if (!user?.id) {
      // ─── Logout: limpiar todos los stores ─────────────────
      setDass21UserId(null);
      setSusUserId(null);
      setAutoUserId(null);
      setFeedbackUserId(null);
      setPaywallUserId(null);
      setPilotoUserId(null);

      resetDass21();
      resetSus();
      resetAuto();
      resetFeedback();
      resetPaywall();
      resetPiloto();
      return;
    }

    let cancelled = false;
    setIsSyncing(true);

    // ─── Login: vincular todos los stores al usuario ────────
    setDass21UserId(user.id);
    setSusUserId(user.id);
    setAutoUserId(user.id);
    setFeedbackUserId(user.id);
    setPaywallUserId(user.id);
    setPilotoUserId(user.id);

    // ─── Sincronizar todos en paralelo ──────────────────────
    Promise.all([
      refreshDass21(user.id),
      refreshSus(user.id),
      refreshAuto(user.id),
      refreshFeedback(user.id),
      refreshPaywall(user.id),
      refreshPiloto(user.id),
    ])
      .catch((err) => console.error('[Piloto] sync error:', err))
      .finally(() => {
        if (!cancelled) setIsSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    user?.id,
    isInitializing,
    setDass21UserId,
    setSusUserId,
    setAutoUserId,
    setFeedbackUserId,
    setPaywallUserId,
    setPilotoUserId,
    refreshDass21,
    refreshSus,
    refreshAuto,
    refreshFeedback,
    refreshPaywall,
    refreshPiloto,
    resetDass21,
    resetSus,
    resetAuto,
    resetFeedback,
    resetPaywall,
    resetPiloto,
  ]);

  return { isSyncing };
}