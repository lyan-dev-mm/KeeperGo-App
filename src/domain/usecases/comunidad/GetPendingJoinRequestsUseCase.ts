import { CommunityRepository } from '../../repositories/comunidad/CommunityRepository';
import { CommunityJoinRequestEntity } from '../../entities/comunidad/CommunityMember';

export class GetPendingJoinRequestsUseCase {
  constructor(private repository: CommunityRepository) {}

  async execute(communityId: string): Promise<CommunityJoinRequestEntity[]> {
    return this.repository.getPendingJoinRequests(communityId);
  }
}