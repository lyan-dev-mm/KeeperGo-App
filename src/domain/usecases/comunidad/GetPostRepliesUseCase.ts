import { CommunityFeedRepository } from '../../repositories/comunidad/CommunityFeedRepository';
import { CommunityPostReplyEntity } from '../../entities/comunidad/CommunityPost';

export class GetPostRepliesUseCase {
  constructor(private repository: CommunityFeedRepository) {}

  async execute(communityId: string, postId: string): Promise<CommunityPostReplyEntity[]> {
    return this.repository.getReplies(communityId, postId);
  }
}