import { MilestoneEntity } from '../../entities/mascota/Milestone';

export interface MilestoneRepository {
  getAllMilestones(): Promise<MilestoneEntity[]>;
}