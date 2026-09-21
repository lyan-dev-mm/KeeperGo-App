import { CommunityActivityRepository } from '../../repositories/comunidad/CommunityActivityRepository';

export class CreateActivityUseCase {
  constructor(private repository: CommunityActivityRepository) {}

  async execute(
    communityId: string,
    createdBy: string,
    title: string,
    description: string,
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    if (!title.trim()) {
      throw new Error('El reto necesita un título.');
    }
    if (endDate < startDate) {
      throw new Error('La fecha de fin no puede ser antes que la de inicio.');
    }
    return this.repository.createActivity(
      communityId,
      createdBy,
      title.trim(),
      description.trim(),
      startDate,
      endDate
    );
  }
}