import { CommunityActivityRepository } from '../../repositories/comunidad/CommunityActivityRepository';

export class ToggleActivityParticipationUseCase {
  constructor(private repository: CommunityActivityRepository) {}

  async execute(
    communityId: string,
    activityId: string,
    uid: string,
    isParticipating: boolean
  ): Promise<void> {
    await this.repository.setActivityParticipation(communityId, activityId, uid, isParticipating);
  }
}