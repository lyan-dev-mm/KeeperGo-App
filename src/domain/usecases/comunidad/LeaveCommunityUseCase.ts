import { CommunityRepository } from '../../repositories/comunidad/CommunityRepository';

export class LeaveCommunityUseCase {
  constructor(private repository: CommunityRepository) {}

  async execute(communityId: string, userId: string): Promise<void> {
    const membership = await this.repository.getMembership(communityId, userId);
    if (!membership) throw new Error('No eres miembro de esta comunidad.');
    if (membership.role === 'owner') {
      throw new Error('El creador no puede salir. Debes eliminar la comunidad.');
    }
    await this.repository.leaveCommunity(communityId, userId);
  }
}