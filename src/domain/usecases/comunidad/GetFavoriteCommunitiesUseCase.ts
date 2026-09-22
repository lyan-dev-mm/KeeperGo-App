import { FavoriteCommunityRepository } from '../../repositories/comunidad/FavoriteCommunityRepository';

export class GetFavoriteCommunitiesUseCase {
  constructor(private repository: FavoriteCommunityRepository) {}

  async execute(userId: string): Promise<string[]> {
    return this.repository.getFavorites(userId);
  }
}