// src/domain/interfaces/IAutopercepcionRepository.ts

import {
  AutopercepcionResponse,
  AutopercepcionTipo,
} from '../entities/autopercepcion/AutopercepcionResponse';

export interface IAutopercepcionRepository {
  saveResponse(response: AutopercepcionResponse): Promise<AutopercepcionResponse>;
  getResponses(userId: string): Promise<AutopercepcionResponse[]>;
  getResponseByTipo(
    userId: string,
    tipo: AutopercepcionTipo
  ): Promise<AutopercepcionResponse | null>;
  hasCompletedPretest(userId: string): Promise<boolean>;
  hasCompletedPostest(userId: string): Promise<boolean>;
}