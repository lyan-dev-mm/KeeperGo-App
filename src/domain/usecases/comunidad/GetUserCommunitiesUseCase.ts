import { CommunityRepository } from '../../repositories/comunidad/CommunityRepository';
import { CommunityEntity } from '../../entities/comunidad/Community';

export class GetUserCommunitiesUseCase {
  constructor(private repository: CommunityRepository) {}

  async execute(userId: string): Promise<CommunityEntity[]> {
    return this.repository.getUserCommunities(userId);
  }
}