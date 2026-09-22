import { Timestamp } from 'firebase/firestore';

export interface FavoriteCommunityEntity {
  communityId: string;
  addedAt: Timestamp | null;
}