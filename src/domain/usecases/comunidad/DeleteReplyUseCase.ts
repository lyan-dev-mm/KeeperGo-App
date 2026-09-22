import { CommunityFeedRepository } from '../../repositories/comunidad/CommunityFeedRepository';

export class DeleteReplyUseCase {
  constructor(private repository: CommunityFeedRepository) {}

  async execute(communityId: string, postId: string, replyId: string): Promise<void> {
    await this.repository.deleteReply(communityId, postId, replyId);
  }
}