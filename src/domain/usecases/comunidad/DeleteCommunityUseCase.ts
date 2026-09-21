import { CommunityRepository } from '../../repositories/comunidad/CommunityRepository';

export class DeleteCommunityUseCase {
  constructor(private repository: CommunityRepository) {}

  async execute(communityId: string, userId: string): Promise<void> {
    const community = await this.repository.getCommunityById(communityId);
    if (!community) throw new Error('La comunidad no existe.');
    if (community.createdBy !== userId) {
      throw new Error('Solo el creador puede eliminar la comunidad.');
    }
    await this.repository.deleteCommunity(communityId);
  }
}