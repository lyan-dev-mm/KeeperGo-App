import { MotivationalMessageEntity, MessageCategory } from '../../entities/mascota/MotivationalMessage';

export interface AdminMessageRepository {
  getAllMessages(): Promise<MotivationalMessageEntity[]>;
  createMessage(text: string, category: MessageCategory): Promise<void>;
  updateMessage(id: string, text: string, category: MessageCategory): Promise<void>;
  toggleActive(id: string, active: boolean): Promise<void>;
  deleteMessage(id: string): Promise<void>;
}