import { MotivationalMessageRepository } from '../../repositories/mascota/MotivationalMessageRepository';
import { DailyMessageEntity, MessageCategory } from '../../entities/mascota/MotivationalMessage';
import { getTodayKey } from '../../../utils/dateUtils';

const FALLBACK_TEXT = 'Cada pequeño paso cuenta. Hoy es un buen día para seguir.';

export class GetDailyMessageUseCase {
  constructor(private repository: MotivationalMessageRepository) {}

  async execute(userId: string, category: MessageCategory = 'general'): Promise<DailyMessageEntity> {
    const todayKey = getTodayKey();

    const existing = await this.repository.getTodayMessage(userId, todayKey);
    if (existing) {
      return existing;
    }

    const recentIds = await this.repository.getRecentMessageIds(userId, 30);

    let message = await this.repository.pickRandomMessage(category, recentIds);
    if (!message) {
      message = await this.repository.pickRandomMessage(category, []);
    }

    if (!message) {
      return {
        userId,
        date: todayKey,
        messageId: 'fallback',
        messageText: FALLBACK_TEXT,
        category: 'general',
        shownAt: new Date().toISOString(),
      };
    }

    const entry: DailyMessageEntity = {
      userId,
      date: todayKey,
      messageId: message.id,
      messageText: message.text,
      category: message.category,
      shownAt: new Date().toISOString(),
    };

    await this.repository.saveDailyMessage(entry);
    await this.repository.incrementUsageCount(message.id);

    return entry;
  }
}