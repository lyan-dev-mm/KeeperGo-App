import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { HabitRepository } from '../../../domain/repositories/habitos/HabitRepository';
import { HabitEntity, CreateHabitInput } from '../../../domain/entities/habitos/Habit';

const HABITS_COLLECTION = 'habits';

export class HabitRepositoryImpl implements HabitRepository {
  private habitsCollection = collection(db, HABITS_COLLECTION);

  async getHabitsByUser(userId: string): Promise<HabitEntity[]> {
    const q = query(this.habitsCollection, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as HabitEntity[];
  }

    async createHabit(userId: string, input: CreateHabitInput): Promise<HabitEntity> {
    const progress = Array.from({ length: 7 }, () => false);
    const activities: any[] = [];

    const newHabitData = {
      userId,
      title: input.title,
      objetivo: input.objetivo,
      semilla: input.semilla,
      icon: input.icon,
      color: input.color,
      progress,
      activities,
      weekStartDate: input.weekStartDate ?? null,
      createdAt: serverTimestamp(), // Esto es para Firestore
    };
    
    const docRef = await addDoc(this.habitsCollection, newHabitData);
    
    // Retornamos un objeto limpio que sí cumple con HabitEntity para la UI
    return {
      id: docRef.id,
      userId,
      title: input.title,
      objetivo: input.objetivo,
      semilla: input.semilla,
      icon: input.icon,
      color: input.color,
      progress,
      activities,
      weekStartDate: input.weekStartDate ?? null,
      createdAt: null // Localmente es null, Firestore lo llenará automáticamente
    };
  }
  async updateHabit(habitId: string, updates: Partial<HabitEntity>): Promise<void> {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    await updateDoc(habitRef, updates);
  }

  async deleteHabit(habitId: string): Promise<void> {
    await deleteDoc(doc(db, HABITS_COLLECTION, habitId));
  }

  async deleteHabits(habitIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    habitIds.forEach((id) => {
      batch.delete(doc(db, HABITS_COLLECTION, id));
    });
    await batch.commit();
  }
}