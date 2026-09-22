import { CommunityRepository } from '../../repositories/comunidad/CommunityRepository';
import { UserNotificationRepository } from '../../repositories/notifications/UserNotificationRepository';

export class RespondToJoinRequestUseCase {
  constructor(
    private communityRepository: CommunityRepository,
    private notificationRepository: UserNotificationRepository
  ) {}

  async execute(communityId: string, uid: string, accept: boolean): Promise<void> {
    if (accept) {
      await this.communityRepository.acceptJoinRequest(communityId, uid);

      try {
        const community = await this.communityRepository.getCommunityById(communityId);
        if (community) {
          await this.notificationRepository.createNotification(uid, {
            type: 'join_accepted',
            communityId,
            communityName: community.name,
          });
        }
      } catch (error) {
        console.error('Error al crear notificación:', error);
      }
    } else {
      await this.communityRepository.rejectJoinRequest(communityId, uid);
    }
  }
}