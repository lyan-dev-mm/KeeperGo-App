import { UserNotificationRepository } from '../../repositories/notifications/UserNotificationRepository';

export class MarkNotificationAsReadUseCase {
  constructor(private repository: UserNotificationRepository) {}

  async execute(userId: string, notificationId: string): Promise<void> {
    await this.repository.markAsRead(userId, notificationId);
  }
}