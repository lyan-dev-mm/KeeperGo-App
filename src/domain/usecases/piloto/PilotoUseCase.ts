// src/domain/usecases/piloto/PilotoUseCases.ts

import { IPilotoRepository } from '../../interfaces/IPilotoRepository';
import { PilotoStatus } from '../../entities/piloto/PilotoStatus';
import { PILOTO_CONFIG } from '../../../../constants/surveyConfig';

export class GetPilotoStatusUseCase {
  constructor(private repository: IPilotoRepository) {}
  execute(userId: string): Promise<PilotoStatus | null> {
    return this.repository.getStatus(userId);
  }
}

export class StartPilotoUseCase {
  constructor(private repository: IPilotoRepository) {}
  execute(userId: string): Promise<PilotoStatus> {
    return this.repository.markAsStarted(userId, PILOTO_CONFIG.VERSION);
  }
}

export class CompletePilotoUseCase {
  constructor(private repository: IPilotoRepository) {}
  execute(userId: string): Promise<PilotoStatus> {
    return this.repository.markAsCompleted(userId);
  }
}