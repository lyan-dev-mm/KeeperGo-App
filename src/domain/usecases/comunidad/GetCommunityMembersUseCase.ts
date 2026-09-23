import { CommunityRepository } from '../../repositories/comunidad/CommunityRepository';
import { CommunityMemberEntity } from '../../entities/comunidad/CommunityMember';

export class GetCommunityMembersUseCase {
  constructor(private repository: CommunityRepository) {}

  async execute(communityId: string): Promise<CommunityMemberEntity[]> {
    return this.repository.getCommunityMembers(communityId);
  }
}