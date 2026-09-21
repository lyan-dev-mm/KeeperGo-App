import { CommunityRepository } from '../../repositories/comunidad/CommunityRepository';
import { CommunityJoinRequestEntity } from '../../entities/comunidad/CommunityMember';

export interface OwnedCommunityWithRequests {
  communityId: string;
  communityName: string;
  requests: CommunityJoinRequestEntity[];
}

export class GetOwnedCommunitiesWithPendingRequestsUseCase {
  constructor(private repository: CommunityRepository) {}

  async execute(userId: string): Promise<OwnedCommunityWithRequests[]> {
    return this.repository.getOwnedCommunitiesWithPendingRequests(userId);
  }
}