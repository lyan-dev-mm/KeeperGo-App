// src/domain/interfaces/IFeedbackRepository.ts

import { FeedbackResponse } from '../entities/feedback/FeedbackResponse';

export interface IFeedbackRepository {
  saveResponse(response: FeedbackResponse): Promise<FeedbackResponse>;
  getResponse(userId: string): Promise<FeedbackResponse | null>;
  hasCompleted(userId: string): Promise<boolean>;
}