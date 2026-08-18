export type MessageCategory =
  | 'general'
  | 'racha'
  | 'nivel'
  | 'actividad'
  | 'recompensa'
  | 'bienvenida'
  | 'logro';

export interface MotivationalMessageEntity {
  id: string;
  text: string;
  category: MessageCategory;
  active: boolean;
  usageCount: number;
  createdAt: string;
  randomIndex: number;
}

export interface DailyMessageEntity {
  userId: string;
  date: string;
  messageId: string;
  messageText: string;
  category: MessageCategory;
  shownAt: string;
}