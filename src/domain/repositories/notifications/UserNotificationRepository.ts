import { UserNotificationEntity } from '../../entities/notifications/UserNotification';

export interface UserNotificationRepository {
  createNotification(
    userId: string,
    notification: Omit<UserNotificationEntity, 'id' | 'createdAt' | 'read'>
  ): Promise<string>;
  getUserNotifications(userId: string): Promise<UserNotificationEntity[]>;
  markAsRead(userId: string, notificationId: string): Promise<void>;
}