import { CommunityFeedRepository } from '../../repositories/comunidad/CommunityFeedRepository';

export class ToggleLikePostUseCase {
  constructor(private repository: CommunityFeedRepository) {}

  async execute(communityId: string, postId: string, uid: string, isLiked: boolean): Promise<void> {
    await this.repository.toggleLikePost(communityId, postId, uid, isLiked);
  }
}