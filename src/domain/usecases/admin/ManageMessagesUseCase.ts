import { AdminMessageRepository } from '../../repositories/admin/AdminMessageRepository';
import { MessageCategory } from '../../entities/mascota/MotivationalMessage';

export class ManageMessagesUseCase {
  constructor(private repository: AdminMessageRepository) {}

  getAll() {
    return this.repository.getAllMessages();
  }

  create(text: string, category: MessageCategory) {
    return this.repository.createMessage(text, category);
  }

  update(id: string, text: string, category: MessageCategory) {
    return this.repository.updateMessage(id, text, category);
  }

  toggleActive(id: string, active: boolean) {
    return this.repository.toggleActive(id, active);
  }

  remove(id: string) {
    return this.repository.deleteMessage(id);
  }
}