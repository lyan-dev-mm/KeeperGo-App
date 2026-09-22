// app/(modals)/CierrePiloto.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/presentation/contexts/AuthContext';
import { usePilotoStatus } from '../../src/presentation/hooks/usePilotoStatus';
import { usePilotoStore } from '../../src/presentation/store/pilotoStore';

import DASS21Screen from '../../src/presentation/screens/dass21/DASS21Screen';
import AutopercepcionScreen from '../../src/presentation/screens/autopercepcion/AutopercepcionScreen';
import SUSScreen from '../../src/presentation/screens/sus/SUSScreen';
import FeedbackScreen from '../../src/presentation/screens/feedback/FeedbackScreen';
import PaywallScreen from '../../src/presentation/screens/paywall/PaywallScreen';
import GraciasPilotoScreen from '../../src/presentation/screens/piloto/GraciasPilotoScreen';

type CierreStep =
  | 'DASS21_POSTEST'
  | 'AUTOPERCEPCION_POSTEST'
  | 'SUS'
  | 'FEEDBACK'
  | 'PAYWALL'
  | 'GRACIAS';

export default function CierrePilotoModal() {
  const router = useRouter();
  const { user } = useAuth();
  const { siguientePaso } = usePilotoStatus(user?.id);
  const { complete } = usePilotoStore();

  const [step, setStep] = useState<CierreStep>('DASS21_POSTEST');

  // Sincroniza el step con el siguiente paso pendiente al montar.
  useEffect(() => {
    if (siguientePaso) {
      setStep(siguientePaso as CierreStep);
    }
  }, [siguientePaso]);

  const advanceTo = (next: CierreStep) => setStep(next);

  const handleFinalizar = async () => {
    await complete();
    setStep('GRACIAS');
  };

  switch (step) {
    
    case 'DASS21_POSTEST':
    return <DASS21Screen tipoOverride="final" onComplete={() => advanceTo('AUTOPERCEPCION_POSTEST')} />;

    case 'AUTOPERCEPCION_POSTEST':
    return <AutopercepcionScreen tipoOverride="postest" onComplete={() => advanceTo('SUS')} />;

    case 'SUS':
      return <SUSScreen onComplete={() => advanceTo('FEEDBACK')} />;

    case 'FEEDBACK':
      return <FeedbackScreen onComplete={() => advanceTo('PAYWALL')} />;

    case 'PAYWALL':
      return <PaywallScreen onComplete={handleFinalizar} />;

    case 'GRACIAS':
      return <GraciasPilotoScreen />;

    default:
      return null;
  }
}

// ─── Wrappers para pasar el parámetro `tipo` a las pantallas ────
// Las pantallas del DASS-21 y Autopercepción usan useLocalSearchParams,
// pero aquí las invocamos directamente con props, así que creamos
// wrappers que inyectan el tipo correcto.

function DASS21Wrapper({
  tipo,
  onComplete,
}: {
  tipo: 'inicial' | 'final';
  onComplete: () => void;
}) {
  // El DASS21Screen usa useLocalSearchParams para leer `tipo`.
  // Aquí lo forzamos vía un hack: renderizamos y luego sobreescribimos.
  // Alternativa: agregar prop `tipoOverride` al DASS21Screen.
  // Por simplicidad, usamos la URL:
  const router = useRouter();
  useEffect(() => {
    // Si no estamos en el step correcto del modal, redirige.
    // (Este wrapper es un placeholder; ver nota abajo.)
  }, []);

  // Como DASS21Screen lee el tipo de la URL, aquí forzamos `final`:
  // Nota: esto requiere modificar DASS21Screen para aceptar `tipoOverride`.
  return <DASS21Screen tipoOverride={tipo} onComplete={onComplete} />;
}

function AutopercepcionWrapper({
  tipo,
  onComplete,
}: {
  tipo: 'pretest' | 'postest';
  onComplete: () => void;
}) {
  return <AutopercepcionScreen tipoOverride={tipo} onComplete={onComplete} />;
}