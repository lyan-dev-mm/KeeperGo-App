import { MotivationalMessageEntity, DailyMessageEntity, MessageCategory } from '../../entities/mascota/MotivationalMessage';

export interface MotivationalMessageRepository {
  getTodayMessage(userId: string, date: string): Promise<DailyMessageEntity | null>;
  getRecentMessageIds(userId: string, days: number): Promise<string[]>;
  pickRandomMessage(
    category: MessageCategory,
    excludeIds: string[]
  ): Promise<MotivationalMessageEntity | null>;
  saveDailyMessage(entry: DailyMessageEntity): Promise<void>;
  incrementUsageCount(messageId: string): Promise<void>;
}