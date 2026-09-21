import { CommunityFeedRepository } from '../../repositories/comunidad/CommunityFeedRepository';

export class UpdatePostUseCase {
  constructor(private repository: CommunityFeedRepository) {}

  async execute(communityId: string, postId: string, newText: string): Promise<void> {
    const trimmed = newText.trim();
    if (!trimmed) throw new Error('La publicación no puede estar vacía.');
    if (trimmed.length > 500) throw new Error('La publicación es demasiado larga.');
    await this.repository.updatePost(communityId, postId, trimmed);
  }
}