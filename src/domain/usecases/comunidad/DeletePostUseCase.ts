import { CommunityFeedRepository } from '../../repositories/comunidad/CommunityFeedRepository';

export class DeletePostUseCase {
  constructor(private repository: CommunityFeedRepository) {}

  async execute(communityId: string, postId: string): Promise<void> {
    await this.repository.deletePost(communityId, postId);
  }
}