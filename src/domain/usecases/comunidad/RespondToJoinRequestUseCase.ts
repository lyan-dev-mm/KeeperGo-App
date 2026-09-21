import { CommunityRepository } from '../../repositories/comunidad/CommunityRepository';

export class RespondToJoinRequestUseCase {
  constructor(private repository: CommunityRepository) {}

  async execute(communityId: string, uid: string, accept: boolean): Promise<void> {
    if (accept) {
      await this.repository.acceptJoinRequest(communityId, uid);
    } else {
      await this.repository.rejectJoinRequest(communityId, uid);
    }
  }
}