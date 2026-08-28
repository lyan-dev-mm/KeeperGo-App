import { useState, useEffect, useCallback } from 'react';
import { MotivationalMessageEntity, MessageCategory } from '../../domain/entities/mascota/MotivationalMessage';
import { ManageMessagesUseCase } from '../../domain/usecases/admin/ManageMessagesUseCase';
import { AdminMessageRepositoryImpl } from '../../data/repositories/admin/AdminMessageRepositoryImpl';

const repository = new AdminMessageRepositoryImpl();
const manageMessagesUseCase = new ManageMessagesUseCase(repository);

export function useAdminMessages() {
  const [messages, setMessages] = useState<MotivationalMessageEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await manageMessagesUseCase.getAll();
      setMessages(result);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createMessage = async (text: string, category: MessageCategory) => {
    await manageMessagesUseCase.create(text, category);
    await load();
  };

  const updateMessage = async (id: string, text: string, category: MessageCategory) => {
    await manageMessagesUseCase.update(id, text, category);
    await load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await manageMessagesUseCase.toggleActive(id, active);
    await load();
  };

  const deleteMessage = async (id: string) => {
    await manageMessagesUseCase.remove(id);
    await load();
  };

  return { messages, isLoading, createMessage, updateMessage, toggleActive, deleteMessage, reload: load };
}