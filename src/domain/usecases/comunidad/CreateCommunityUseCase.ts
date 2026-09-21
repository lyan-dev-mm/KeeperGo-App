import { CommunityRepository } from '../../repositories/comunidad/CommunityRepository';
import { CreateCommunityInput } from '../../entities/comunidad/Community';

export class CreateCommunityUseCase {
  constructor(private repository: CommunityRepository) {}

  async execute(input: CreateCommunityInput, createdBy: string): Promise<string> {
    if (!input.name.trim()) {
      throw new Error('El nombre de la comunidad es obligatorio.');
    }
    return this.repository.createCommunity(input, createdBy);
  }
}