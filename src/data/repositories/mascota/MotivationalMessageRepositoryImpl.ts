import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  startAt,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { MotivationalMessageRepository } from '../../../domain/repositories/mascota/MotivationalMessageRepository';
import {
  MotivationalMessageEntity,
  DailyMessageEntity,
  MessageCategory,
} from '../../../domain/entities/mascota/MotivationalMessage';

const MESSAGES_COLLECTION = 'motivational_messages';
const DAILY_COLLECTION = 'daily_messages';
const CANDIDATE_POOL_SIZE = 15;

export class MotivationalMessageRepositoryImpl implements MotivationalMessageRepository {
  async getTodayMessage(userId: string, date: string): Promise<DailyMessageEntity | null> {
    const docRef = doc(db, DAILY_COLLECTION, `${userId}_${date}`);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as DailyMessageEntity;
  }

  async getRecentMessageIds(userId: string, days: number): Promise<string[]> {
    const q = query(
      collection(db, DAILY_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(days)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => (d.data() as DailyMessageEntity).messageId);
  }

  async pickRandomMessage(
    category: MessageCategory,
    excludeIds: string[]
  ): Promise<MotivationalMessageEntity | null> {
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const randomStart = Math.random();

    const primaryQuery = query(
      messagesRef,
      where('category', '==', category),
      where('active', '==', true),
      orderBy('randomIndex'),
      startAt(randomStart),
      limit(CANDIDATE_POOL_SIZE)
    );

    let candidates = await this.runCandidateQuery(primaryQuery, excludeIds);

    if (candidates.length === 0) {
      const wrapQuery = query(
        messagesRef,
        where('category', '==', category),
        where('active', '==', true),
        orderBy('randomIndex'),
        limit(CANDIDATE_POOL_SIZE)
      );
      candidates = await this.runCandidateQuery(wrapQuery, excludeIds);
    }

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  private async runCandidateQuery(
    q: ReturnType<typeof query>,
    excludeIds: string[]
  ): Promise<MotivationalMessageEntity[]> {
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ({ id: d.id, ...(d.data() as object) } as MotivationalMessageEntity))
      .filter((m) => !excludeIds.includes(m.id));
  }

  async saveDailyMessage(entry: DailyMessageEntity): Promise<void> {
    const docRef = doc(db, DAILY_COLLECTION, `${entry.userId}_${entry.date}`);
    await setDoc(docRef, entry);
  }

  async incrementUsageCount(messageId: string): Promise<void> {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(docRef, { usageCount: increment(1) });
  }
}