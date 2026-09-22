// src/domain/interfaces/ISUSRepository.ts

import { SUSResponse } from '../entities/sus/SUSResponse';

export interface ISUSRepository {
  saveResponse(response: SUSResponse): Promise<SUSResponse>;
  getResponse(userId: string): Promise<SUSResponse | null>;
  hasCompleted(userId: string): Promise<boolean>;
}