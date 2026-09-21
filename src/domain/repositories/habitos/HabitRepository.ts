import { HabitEntity, CreateHabitInput } from '../../entities/habitos/Habit';

export interface HabitRepository {
  getHabitsByUser(userId: string): Promise<HabitEntity[]>;
  createHabit(userId: string, input: CreateHabitInput): Promise<HabitEntity>;
  updateHabit(habitId: string, updates: Partial<HabitEntity>): Promise<void>;
  deleteHabit(habitId: string): Promise<void>;
  deleteHabits(habitIds: string[]): Promise<void>;
}