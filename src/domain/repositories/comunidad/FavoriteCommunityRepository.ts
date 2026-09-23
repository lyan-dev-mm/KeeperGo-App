export interface FavoriteCommunityRepository {
  addFavorite(userId: string, communityId: string): Promise<void>;
  removeFavorite(userId: string, communityId: string): Promise<void>;
  getFavorites(userId: string): Promise<string[]>;
}