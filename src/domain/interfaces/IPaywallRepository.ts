// src/domain/interfaces/IPaywallRepository.ts

import { PaywallResponse } from '../entities/paywall/PaywallResponse';

export interface IPaywallRepository {
  saveResponse(response: PaywallResponse): Promise<PaywallResponse>;
  getResponse(userId: string): Promise<PaywallResponse | null>;
  hasCompleted(userId: string): Promise<boolean>;
}