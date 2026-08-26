import { useState, useEffect, useCallback } from 'react';
import { AdminUserSummary } from '../../domain/entities/admin/AdminUserSummary';
import { GetAdminUsersUseCase } from '../../domain/usecases/admin/GetAdminUsersUseCase';
import { AdminUserRepositoryImpl } from '../../data/repositories/admin/AdminUserRepositoryImpl';
import { UpdateUserPetUseCase } from '../../domain/usecases/admin/UpdateUserPetUseCase';
import { AdminPetRepositoryImpl } from '../../data/repositories/admin/AdminPetRepositoryImpl';
import { PetStatsUpdate } from '../../domain/repositories/admin/AdminPetRepository';

const userRepository = new AdminUserRepositoryImpl();
const getAdminUsersUseCase = new GetAdminUsersUseCase(userRepository);

const petRepository = new AdminPetRepositoryImpl();
const updateUserPetUseCase = new UpdateUserPetUseCase(petRepository);

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAdminUsersUseCase.execute();
      setUsers(result);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateUserPet = async (uid: string, updates: PetStatsUpdate) => {
    await updateUserPetUseCase.execute(uid, updates);
    await load();
  };

  return { users, isLoading, updateUserPet, reload: load };
}