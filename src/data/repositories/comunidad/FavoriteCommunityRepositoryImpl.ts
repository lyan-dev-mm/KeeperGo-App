import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { FavoriteCommunityRepository } from '../../../domain/repositories/comunidad/FavoriteCommunityRepository';

const USERS_COLLECTION = 'users';
const FAVORITES_SUBCOLLECTION = 'favoriteCommunities';

export class FavoriteCommunityRepositoryImpl implements FavoriteCommunityRepository {
  private favoritesCollection(userId: string) {
    return collection(db, USERS_COLLECTION, userId, FAVORITES_SUBCOLLECTION);
  }

  private favoriteDocRef(userId: string, communityId: string) {
    return doc(db, USERS_COLLECTION, userId, FAVORITES_SUBCOLLECTION, communityId);
  }

  async addFavorite(userId: string, communityId: string): Promise<void> {
    await setDoc(this.favoriteDocRef(userId, communityId), {
      communityId,
      addedAt: serverTimestamp(),
    });
  }

  async removeFavorite(userId: string, communityId: string): Promise<void> {
    await deleteDoc(this.favoriteDocRef(userId, communityId));
  }

  async getFavorites(userId: string): Promise<string[]> {
    const snapshot = await getDocs(this.favoritesCollection(userId));
    return snapshot.docs.map((docSnap) => docSnap.id);
  }
}