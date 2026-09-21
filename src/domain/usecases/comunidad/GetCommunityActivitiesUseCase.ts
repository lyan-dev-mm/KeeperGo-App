import { CommunityActivityRepository } from '../../repositories/comunidad/CommunityActivityRepository';
import { CommunityActivityEntity } from '../../entities/comunidad/CommunityActivity';

export class GetCommunityActivitiesUseCase {
  constructor(private repository: CommunityActivityRepository) {}

  async execute(communityId: string): Promise<CommunityActivityEntity[]> {
    return this.repository.getActivities(communityId);
  }
}