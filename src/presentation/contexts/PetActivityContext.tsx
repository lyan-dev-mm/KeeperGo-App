import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  RegisterActivityUseCase,
  RegisterActivityResult,
} from '../../domain/usecases/mascota/RegisterActivityUseCase';
import { PetRepositoryImpl } from '../../data/repositories/mascota/PetRepositoryImpl';
import { MilestoneRepositoryImpl } from '../../data/repositories/mascota/MilestoneRepositoryImpl';

const repository = new PetRepositoryImpl();
const milestoneRepository = new MilestoneRepositoryImpl();
const registerActivityUseCase = new RegisterActivityUseCase(repository, milestoneRepository);

interface PetActivityContextType {
  pendingResult: RegisterActivityResult | null;
  consumePendingResult: () => RegisterActivityResult | null;
}

const PetActivityContext = createContext<PetActivityContextType | undefined>(undefined);

export function PetActivityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pendingResult, setPendingResult] = useState<RegisterActivityResult | null>(null);
  const checkedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (checkedForUserRef.current === user.id) return;
    checkedForUserRef.current = user.id;

    (async () => {
      try {
        const result = await registerActivityUseCase.execute(user.id);
        if (result.streakIncreased) {
          setPendingResult(result);
        }
      } catch {
        // Silencioso: si falla la red, el usuario simplemente no registra
        // actividad automática en este momento, pero puede seguir usando la app.
      }
    })();
  }, [user]);

  const consumePendingResult = useCallback((): RegisterActivityResult | null => {
    const current = pendingResult;
    setPendingResult(null);
    return current;
  }, [pendingResult]);

  return (
    <PetActivityContext.Provider value={{ pendingResult, consumePendingResult }}>
      {children}
    </PetActivityContext.Provider>
  );
}

export function usePetActivity() {
  const ctx = useContext(PetActivityContext);
  if (!ctx) {
    throw new Error('usePetActivity debe usarse dentro de PetActivityProvider');
  }
  return ctx;
}