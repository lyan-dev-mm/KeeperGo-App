// app/(modals)/BienvenidaPiloto.tsx

import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BienvenidaPilotoScreen, {
  BienvenidaVariante,
} from '../../src/presentation/screens/piloto/BienvenidaPilotoScreen';
import { usePilotoStore } from '../../src/presentation/store/pilotoStore';

export default function BienvenidaPilotoModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ variante?: string }>();
  const variante: BienvenidaVariante =
    (params.variante as BienvenidaVariante) || 'inicio';

  const { start } = usePilotoStore();

  const handleContinue = async () => {
  if (variante === 'inicio') {
    await start();
    router.back();
  } else {
    router.replace('/(modals)/CierrePiloto');
  }
};

  return (
    <BienvenidaPilotoScreen variante={variante} onContinue={handleContinue} />
  );
}