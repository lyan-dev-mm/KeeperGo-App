import { UserNotificationRepository } from '../../repositories/notifications/UserNotificationRepository';
import { UserNotificationEntity } from '../../entities/notifications/UserNotification';

export class GetUserNotificationsUseCase {
  constructor(private repository: UserNotificationRepository) {}

  async execute(userId: string): Promise<UserNotificationEntity[]> {
    return this.repository.getUserNotifications(userId);
  }
}