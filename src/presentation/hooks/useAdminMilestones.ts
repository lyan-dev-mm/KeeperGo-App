import { useState, useEffect, useCallback } from 'react';
import { MilestoneEntity } from '../../domain/entities/mascota/Milestone';
import { ManageMilestonesUseCase } from '../../domain/usecases/admin/ManageMilestonesUseCase';
import { AdminMilestoneRepositoryImpl } from '../../data/repositories/admin/AdminMilestoneRepositoryImpl';

const repository = new AdminMilestoneRepositoryImpl();
const manageMilestonesUseCase = new ManageMilestonesUseCase(repository);

const DEFAULT_MILESTONES = [
  { days: 3, label: 'Primeros pasos' },
  { days: 7, label: 'Una semana completa' },
  { days: 15, label: 'Medio mes' },
  { days: 30, label: 'Un mes entero' },
  { days: 60, label: 'Dos meses seguidos' },
  { days: 100, label: 'Racha legendaria' },
];

export function useAdminMilestones() {
  const [milestones, setMilestones] = useState<MilestoneEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await manageMilestonesUseCase.getAll();
      setMilestones(result.sort((a, b) => a.days - b.days));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createMilestone = async (days: number, label: string) => {
    await manageMilestonesUseCase.create(days, label);
    await load();
  };

  const updateMilestone = async (id: string, days: number, label: string) => {
    await manageMilestonesUseCase.update(id, days, label);
    await load();
  };

  const deleteMilestone = async (id: string) => {
    await manageMilestonesUseCase.remove(id);
    await load();
  };

  const seedDefaults = async () => {
    setIsSeeding(true);
    try {
      for (const m of DEFAULT_MILESTONES) {
        await manageMilestonesUseCase.create(m.days, m.label);
      }
      await load();
    } finally {
      setIsSeeding(false);
    }
  };

  return {
    milestones,
    isLoading,
    isSeeding,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    seedDefaults,
    reload: load,
  };
}