import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { AdminUserRepository } from '../../../domain/repositories/admin/AdminUserRepository';
import { AdminUserSummary } from '../../../domain/entities/admin/AdminUserSummary';

export class AdminUserRepositoryImpl implements AdminUserRepository {
  async getAllUsers(): Promise<AdminUserSummary[]> {
    const [usersSnap, petsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
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
        name: userData.name,
        createdAt,
        petName: pet?.name,
        level: pet?.level,
        currentStreak: pet?.currentStreak,
        bestStreak: pet?.bestStreak,
      };
    });
  }
}