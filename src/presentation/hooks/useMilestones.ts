import { useState, useEffect, useCallback } from 'react';
import { MilestoneEntity } from '../../domain/entities/mascota/Milestone';
import { GetMilestonesUseCase } from '../../domain/usecases/mascota/GetMilestonesUseCase';
import { MilestoneRepositoryImpl } from '../../data/repositories/mascota/MilestoneRepositoryImpl';

const repository = new MilestoneRepositoryImpl();
const getMilestonesUseCase = new GetMilestonesUseCase(repository);

export function useMilestones() {
  const [milestones, setMilestones] = useState<MilestoneEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getMilestonesUseCase.execute();
      setMilestones(result);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { milestones, isLoading, reload: load };
}