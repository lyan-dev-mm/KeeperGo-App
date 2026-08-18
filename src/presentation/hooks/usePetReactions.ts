import { useRef, useCallback, useState } from 'react';
import { PetEventType, PetAnimationType } from '../../domain/entities/mascota/PetEvent';
import { GetEventReactionUseCase } from '../../domain/usecases/mascota/GetEventReactionUseCase';
import { MotivationalMessageRepositoryImpl } from '../../data/repositories/mascota/MotivationalMessageRepositoryImpl';
import { InteractivePetHandle } from '../components/InteractivePet';

const repository = new MotivationalMessageRepositoryImpl();
const getEventReactionUseCase = new GetEventReactionUseCase(repository);

export function usePetReactions() {
  const petRef = useRef<InteractivePetHandle>(null);
  const lastAnimationRef = useRef<PetAnimationType | undefined>(undefined);
  const [reactionMessage, setReactionMessage] = useState<string | null>(null);

  const triggerEvent = useCallback(async (event: PetEventType) => {
    try {
      const reaction = await getEventReactionUseCase.execute(event, lastAnimationRef.current);
      lastAnimationRef.current = reaction.animation;
      petRef.current?.play(reaction.animation);
      if (reaction.message) {
        setReactionMessage(reaction.message);
      }
    } catch {
      // Silencioso: si falla la red, al menos la animación local ya corrió.
    }
  }, []);

  return { petRef, reactionMessage, triggerEvent };
}