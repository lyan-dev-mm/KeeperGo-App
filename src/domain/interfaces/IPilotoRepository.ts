// src/domain/interfaces/IPilotoRepository.ts

import { PilotoStatus } from '../entities/piloto/PilotoStatus';

export interface IPilotoRepository {
  getStatus(userId: string): Promise<PilotoStatus | null>;
  saveStatus(status: PilotoStatus): Promise<PilotoStatus>;
  markAsCompleted(userId: string): Promise<PilotoStatus>;
  markAsStarted(userId: string, version: string): Promise<PilotoStatus>;
}