import { useState, useEffect, useCallback } from 'react';
import { PetEntity, createDefaultPet } from '../../domain/entities/mascota/Pet';
import { GetPetUseCase } from '../../domain/usecases/mascota/GetPetUseCase';
import {
  RegisterActivityUseCase,
  RegisterActivityResult,
} from '../../domain/usecases/mascota/RegisterActivityUseCase';
import { UpdatePetNameUseCase } from '../../domain/usecases/mascota/UpdatePetNameUseCase';
import { UpdateSelectedPetUseCase } from '../../domain/usecases/mascota/UpdateSelectedPetUseCase';
import { FeedPetUseCase } from '../../domain/usecases/mascota/FeedPetUseCase';
import { PetRepositoryImpl } from '../../data/repositories/mascota/PetRepositoryImpl';
import { MilestoneRepositoryImpl } from '../../data/repositories/mascota/MilestoneRepositoryImpl';
import { PetOptionRepositoryImpl } from '../../data/repositories/mascota/PetOptionRepositoryImpl';
import { useAuth } from './useAuth';

const repository = new PetRepositoryImpl();
const milestoneRepository = new MilestoneRepositoryImpl();
const petOptionRepository = new PetOptionRepositoryImpl();
const getPetUseCase = new GetPetUseCase(repository);
const registerActivityUseCase = new RegisterActivityUseCase(repository, milestoneRepository);
const updatePetNameUseCase = new UpdatePetNameUseCase(repository);
const updateSelectedPetUseCase = new UpdateSelectedPetUseCase(repository, petOptionRepository);
const feedPetUseCase = new FeedPetUseCase(repository, petOptionRepository);

export function usePet() {
  const { user } = useAuth();
  const [pet, setPet] = useState<PetEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPet = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPetUseCase.execute(user.id);
      setPet(result);
    } catch (e) {
      setError('No se pudo cargar tu mascota. Intenta de nuevo.');
      setPet(createDefaultPet(user.id));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPet();
  }, [loadPet]);

  const registerActivity = useCallback(async (): Promise<RegisterActivityResult | null> => {
    if (!user) return null;
    const result = await registerActivityUseCase.execute(user.id);
    setPet(result.pet);
    return result;
  }, [user]);

  const updateName = useCallback(
    async (newName: string) => {
      if (!user) return;
      const result = await updatePetNameUseCase.execute(user.id, newName);
      setPet(result);
      return result;
    },
    [user]
  );

  const selectPet = useCallback(
    async (petId: string) => {
      if (!user) return;
      const result = await updateSelectedPetUseCase.execute(user.id, petId);
      setPet(result);
      return result;
    },
    [user]
  );

  const feedPet = useCallback(
    async (petOptionId: string) => {
      if (!user) return;
      const result = await feedPetUseCase.execute(user.id, petOptionId);
      setPet(result);
      return result;
    },
    [user]
  );

  return { pet, isLoading, error, registerActivity, updateName, selectPet, feedPet, reload: loadPet };
}