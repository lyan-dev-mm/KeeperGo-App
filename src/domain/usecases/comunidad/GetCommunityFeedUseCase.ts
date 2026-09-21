import { CommunityFeedRepository } from '../../repositories/comunidad/CommunityFeedRepository';
import { CommunityPostEntity } from '../../entities/comunidad/CommunityPost';

export interface CommunityFeedResult {
  recent: CommunityPostEntity[];
  featured: CommunityPostEntity[];
}

export class GetCommunityFeedUseCase {
  constructor(private repository: CommunityFeedRepository) {}

  async execute(communityId: string): Promise<CommunityFeedResult> {
    const [recent, featured] = await Promise.all([
      this.repository.getRecentPosts(communityId),
      this.repository.getFeaturedPosts(communityId),
    ]);
    return { recent, featured };
  }
}