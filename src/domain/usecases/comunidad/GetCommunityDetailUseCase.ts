import { CommunityRepository } from '../../repositories/comunidad/CommunityRepository';
import { CommunityEntity } from '../../entities/comunidad/Community';
import { CommunityMemberEntity, CommunityJoinRequestEntity } from '../../entities/comunidad/CommunityMember';

export interface CommunityDetailResult {
  community: CommunityEntity;
  membership: CommunityMemberEntity | null;
  joinRequest: CommunityJoinRequestEntity | null;
}

export class GetCommunityDetailUseCase {
  constructor(private repository: CommunityRepository) {}

  async execute(communityId: string, userId: string): Promise<CommunityDetailResult> {
    const community = await this.repository.getCommunityById(communityId);
    if (!community) throw new Error('No se encontró la comunidad.');

    const membership = await this.repository.getMembership(communityId, userId);
    const joinRequest = membership ? null : await this.repository.getUserJoinRequest(communityId, userId);

    return { community, membership, joinRequest };
  }
}