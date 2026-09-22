import { CommunityFeedRepository } from '../../repositories/comunidad/CommunityFeedRepository';

export class AddReplyUseCase {
  constructor(private repository: CommunityFeedRepository) {}

  async execute(
    communityId: string,
    postId: string,
    authorId: string,
    authorName: string,
    text: string
  ): Promise<string> {
    if (!text.trim()) {
      throw new Error('La respuesta no puede estar vacía.');
    }
    return this.repository.addReply(communityId, postId, authorId, authorName, text.trim());
  }
}