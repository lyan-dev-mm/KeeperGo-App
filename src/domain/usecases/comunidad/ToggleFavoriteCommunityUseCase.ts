import { FavoriteCommunityRepository } from '../../repositories/comunidad/FavoriteCommunityRepository';

export class ToggleFavoriteCommunityUseCase {
  constructor(private repository: FavoriteCommunityRepository) {}

  async execute(userId: string, communityId: string, isFavorite: boolean): Promise<void> {
    if (isFavorite) {
      await this.repository.removeFavorite(userId, communityId);
    } else {
      await this.repository.addFavorite(userId, communityId);
    }
  }
}