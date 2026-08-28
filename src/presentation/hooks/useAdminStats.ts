import { useState, useEffect, useCallback } from 'react';
import { AdminStats } from '../../domain/entities/admin/AdminStats';
import { GetAdminStatsUseCase } from '../../domain/usecases/admin/GetAdminStatsUseCase';
import { AdminUserRepositoryImpl } from '../../data/repositories/admin/AdminUserRepositoryImpl';
import { AdminMessageRepositoryImpl } from '../../data/repositories/admin/AdminMessageRepositoryImpl';

const userRepository = new AdminUserRepositoryImpl();
const messageRepository = new AdminMessageRepositoryImpl();
const getAdminStatsUseCase = new GetAdminStatsUseCase(userRepository, messageRepository);

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAdminStatsUseCase.execute();
      setStats(result);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, isLoading, reload: load };
}