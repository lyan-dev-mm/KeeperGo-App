import { CommunityFeedRepository } from '../../repositories/comunidad/CommunityFeedRepository';

export class CreatePostUseCase {
  constructor(private repository: CommunityFeedRepository) {}

  async execute(
    communityId: string,
    authorId: string,
    authorName: string,
    authorColor: string,
    text: string
  ): Promise<string> {
    if (!text.trim()) {
      throw new Error('La publicación no puede estar vacía.');
    }
    return this.repository.createPost(communityId, authorId, authorName, authorColor, text.trim());
  }
}