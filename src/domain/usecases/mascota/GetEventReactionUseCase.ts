import { MotivationalMessageRepository } from '../../repositories/mascota/MotivationalMessageRepository';
import {
  PetEventType,
  PetAnimationType,
  PetReaction,
  EVENT_ANIMATION,
  EVENT_CATEGORY_MAP,
  DEFAULT_EVENT_MESSAGES,
  pickRandomTapAnimation,
} from '../../entities/mascota/PetEvent';

export class GetEventReactionUseCase {
  constructor(private messageRepository: MotivationalMessageRepository) {}

  async execute(event: PetEventType, lastAnimation?: PetAnimationType): Promise<PetReaction> {
    const animation: PetAnimationType =
      event === 'INTERACCION_MASCOTA' ? pickRandomTapAnimation(lastAnimation) : EVENT_ANIMATION[event];

    const category = EVENT_CATEGORY_MAP[event];
    let message: string | null = null;

    if (category) {
      try {
        const picked = await this.messageRepository.pickRandomMessage(category, []);
        message = picked?.text ?? DEFAULT_EVENT_MESSAGES[event];
      } catch {
        message = DEFAULT_EVENT_MESSAGES[event];
      }
    }

    return { event, animation, message };
  }
}