import { useState, useEffect } from 'react';
import { GetDailyMessageUseCase } from '../../domain/usecases/mascota/GetDailyMessageUseCase';
import { MotivationalMessageRepositoryImpl } from '../../data/repositories/mascota/MotivationalMessageRepositoryImpl';
import { useAuth } from './useAuth';

const repository = new MotivationalMessageRepositoryImpl();
const getDailyMessageUseCase = new GetDailyMessageUseCase(repository);

const DEFAULT_MESSAGE = '¡Sigue así, vas muy bien!';

export function useDailyMessage() {
  const { user } = useAuth();
  const [message, setMessage] = useState<string>(DEFAULT_MESSAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    (async () => {
      setIsLoading(true);
      try {
        const result = await getDailyMessageUseCase.execute(user.id, 'general');
        if (isMounted) setMessage(result.messageText);
      } catch {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { message, isLoading };
}