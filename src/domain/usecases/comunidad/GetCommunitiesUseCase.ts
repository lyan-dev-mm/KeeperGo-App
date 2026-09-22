import { CommunityRepository } from '../../repositories/comunidad/CommunityRepository';
import { CommunityEntity } from '../../entities/comunidad/Community';

export class GetCommunitiesUseCase {
  constructor(private repository: CommunityRepository) {}

  async execute(): Promise<CommunityEntity[]> {
    return this.repository.getCommunities();
  }
}