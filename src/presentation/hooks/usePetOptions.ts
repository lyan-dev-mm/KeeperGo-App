import { useState, useEffect, useCallback } from 'react';
import { PetOptionEntity } from '../../domain/entities/mascota/PetOption';
import { GetPetOptionsUseCase } from '../../domain/usecases/mascota/GetPetOptionsUseCase';
import { PetOptionRepositoryImpl } from '../../data/repositories/mascota/PetOptionRepositoryImpl';

const repository = new PetOptionRepositoryImpl();
const getPetOptionsUseCase = new GetPetOptionsUseCase(repository);

export function usePetOptions() {
  const [petOptions, setPetOptions] = useState<PetOptionEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPetOptionsUseCase.execute();
      setPetOptions(result);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { petOptions, isLoading, reload: load };
}