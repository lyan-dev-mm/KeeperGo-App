import { AdminMilestoneRepository } from '../../repositories/admin/AdminMilestoneRepository';

export class ManageMilestonesUseCase {
  constructor(private repository: AdminMilestoneRepository) {}

  getAll() {
    return this.repository.getAllMilestones();
  }

  create(days: number, label: string) {
    return this.repository.createMilestone(days, label);
  }

  update(id: string, days: number, label: string) {
    return this.repository.updateMilestone(id, days, label);
  }

  remove(id: string) {
    return this.repository.deleteMilestone(id);
  }
}