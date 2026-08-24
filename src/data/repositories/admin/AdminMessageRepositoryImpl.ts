import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { AdminMessageRepository } from '../../../domain/repositories/admin/AdminMessageRepository';
import { MotivationalMessageEntity, MessageCategory } from '../../../domain/entities/mascota/MotivationalMessage';

const COLLECTION = 'motivational_messages';

export class AdminMessageRepositoryImpl implements AdminMessageRepository {
  async getAllMessages(): Promise<MotivationalMessageEntity[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MotivationalMessageEntity));
  }

  async createMessage(text: string, category: MessageCategory): Promise<void> {
    await addDoc(collection(db, COLLECTION), {
      text,
      category,
      active: true,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      randomIndex: Math.random(),
    });
  }

  async updateMessage(id: string, text: string, category: MessageCategory): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { text, category });
  }

  async toggleActive(id: string, active: boolean): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { active });
  }

  async deleteMessage(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }
}