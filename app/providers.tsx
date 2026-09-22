
import React from 'react';
import { PetActivityProvider } from '../src/presentation/contexts/PetActivityContext';
import { HabitsProvider } from '../src/presentation/contexts/HabitsContext';
import { usePilotoSync } from '../src/presentation/hooks/usePilotoSync';

/**
 * Componente interno que sincroniza el estado del DASS-21 con el usuario.
 * Debe estar DENTRO de <AuthProvider> porque usa useAuth().
 * No renderiza nada visible.
 */
function PilotoSync({ children }: { children: React.ReactNode }) {
  usePilotoSync();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PilotoSync>
      <PetActivityProvider>
        <HabitsProvider>
          {children}
        </HabitsProvider>
      </PetActivityProvider>
    </PilotoSync>
  );
}