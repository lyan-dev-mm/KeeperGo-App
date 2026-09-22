import { CommunityRepository } from '../../repositories/comunidad/CommunityRepository';

export type JoinOutcome = 'joined' | 'requested';

export class JoinOrRequestCommunityUseCase {
  constructor(private repository: CommunityRepository) {}

  async execute(communityId: string, uid: string, userName: string): Promise<JoinOutcome> {
    const community = await this.repository.getCommunityById(communityId);
    if (!community) {
      throw new Error('No se encontró la comunidad.');
    }

    if (community.visibility === 'private') {
      await this.repository.requestToJoinCommunity(communityId, uid, userName);
      return 'requested';
    }

    await this.repository.joinCommunity(communityId, uid);
    return 'joined';
  }
}