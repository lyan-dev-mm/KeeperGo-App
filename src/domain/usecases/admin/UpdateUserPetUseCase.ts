import { AdminPetRepository, PetStatsUpdate } from '../../repositories/admin/AdminPetRepository';

export class UpdateUserPetUseCase {
  constructor(private repository: AdminPetRepository) {}

  execute(uid: string, updates: PetStatsUpdate): Promise<void> {
    return this.repository.updatePetStats(uid, updates);
  }
}