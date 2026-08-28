import { MilestoneEntity } from '../../entities/mascota/Milestone';

export interface AdminMilestoneRepository {
  getAllMilestones(): Promise<MilestoneEntity[]>;
  createMilestone(days: number, label: string): Promise<void>;
  updateMilestone(id: string, days: number, label: string): Promise<void>;
  deleteMilestone(id: string): Promise<void>;
}