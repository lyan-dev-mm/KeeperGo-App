import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { AdminUserRepository } from '../../../domain/repositories/admin/AdminUserRepository';
import { AdminUserSummary } from '../../../domain/entities/admin/AdminUserSummary';

const COLLECTION = 'userProfiles';

export class AdminUserRepositoryImpl implements AdminUserRepository {
  async getAllUsers(): Promise<AdminUserSummary[]> {
    const [usersSnap, petsSnap] = await Promise.all([
      getDocs(collection(db, COLLECTION)),
      getDocs(collection(db, 'mascotas')),
    ]);

    const petsByUid = new Map<string, any>();
    petsSnap.forEach((d) => petsByUid.set(d.id, d.data()));

    return usersSnap.docs.map((d) => {
      const userData: any = d.data();
      const pet = petsByUid.get(d.id);
      const createdAt = userData.createdAt?.toDate
        ? userData.createdAt.toDate().toISOString()
        : undefined;

      return {
        uid: d.id,
        email: userData.email ?? '',
        name: userData.generalInfo?.username,
        createdAt,
        petName: pet?.name,
        level: pet?.level,
        currentStreak: pet?.currentStreak,
        bestStreak: pet?.bestStreak,
        unlockedPetIds: pet?.unlockedPetIds ?? [],
        disabled: userData.disabled === true,
      };
    });
  }

  async setUserDisabled(uid: string, disabled: boolean): Promise<void> {
    await updateDoc(doc(db, COLLECTION, uid), {
      disabled,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteUserData(uid: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, uid));
    try {
      await deleteDoc(doc(db, 'mascotas', uid));
    } catch {
      // Puede que este usuario nunca haya abierto Mascota Virtual.
    }
  }
}