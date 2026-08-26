import { MilestoneRepository } from '../../repositories/mascota/MilestoneRepository';
import { MilestoneEntity } from '../../entities/mascota/Milestone';

export class GetMilestonesUseCase {
  constructor(private repository: MilestoneRepository) {}

  async execute(): Promise<MilestoneEntity[]> {
    const milestones = await this.repository.getAllMilestones();
    return milestones.sort((a, b) => a.days - b.days);
  }
}