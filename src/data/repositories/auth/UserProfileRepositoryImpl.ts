import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { UserProfileRepository } from '../../../domain/repositories/auth/UserProfileRepository';
import { UserProfileEntity } from '../../../domain/entities/auth/UserProfile';

const COLLECTION = 'userProfiles';

export class UserProfileRepositoryImpl implements UserProfileRepository {
  async createUserProfile(profile: UserProfileEntity): Promise<void> {
    await setDoc(doc(db, COLLECTION, profile.uid), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }

  async getUserProfile(uid: string): Promise<UserProfileEntity | null> {
    const snapshot = await getDoc(doc(db, COLLECTION, uid));
    if (!snapshot.exists()) return null;
    return { uid: snapshot.id, ...snapshot.data() } as UserProfileEntity;
  }

  async updateUserProfile(uid: string, data: Partial<UserProfileEntity>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
}