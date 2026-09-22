import { CommunityActivityEntity } from '../../entities/comunidad/CommunityActivity';

export interface CommunityActivityRepository {
  getActivities(communityId: string): Promise<CommunityActivityEntity[]>;
  createActivity(
    communityId: string,
    createdBy: string,
    title: string,
    description: string,
    startDate: Date,
    endDate: Date
  ): Promise<string>;
  setActivityParticipation(
    communityId: string,
    activityId: string,
    uid: string,
    isParticipating: boolean
  ): Promise<void>;
}