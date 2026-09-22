import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { UserNotificationRepository } from '../../../domain/repositories/notifications/UserNotificationRepository';
import { UserNotificationEntity } from '../../../domain/entities/notifications/UserNotification';

const USERS_COLLECTION = 'users';
const NOTIFICATIONS_SUBCOLLECTION = 'notifications';

function notificationFromSnapshot(
  snapshot: QueryDocumentSnapshot<DocumentData>
): UserNotificationEntity {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    type: data.type,
    communityId: data.communityId,
    communityName: data.communityName,
    read: data.read ?? false,
    createdAt: data.createdAt ?? null,
  };
}

export class UserNotificationRepositoryImpl implements UserNotificationRepository {
  private notificationsCollection(userId: string) {
    return collection(db, USERS_COLLECTION, userId, NOTIFICATIONS_SUBCOLLECTION);
  }

  private notificationDocRef(userId: string, notificationId: string) {
    return doc(db, USERS_COLLECTION, userId, NOTIFICATIONS_SUBCOLLECTION, notificationId);
  }

  async createNotification(
    userId: string,
    notification: Omit<UserNotificationEntity, 'id' | 'createdAt' | 'read'>
  ): Promise<string> {
    const ref = await addDoc(this.notificationsCollection(userId), {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  async getUserNotifications(userId: string): Promise<UserNotificationEntity[]> {
    const q = query(this.notificationsCollection(userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(notificationFromSnapshot);
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await updateDoc(this.notificationDocRef(userId, notificationId), { read: true });
  }
}