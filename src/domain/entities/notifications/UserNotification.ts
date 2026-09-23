import { Timestamp } from 'firebase/firestore';

export type UserNotificationType = 'join_accepted';

export interface UserNotificationEntity {
  id: string;
  type: UserNotificationType;
  communityId: string;
  communityName: string;
  read: boolean;
  createdAt: Timestamp | null;
}