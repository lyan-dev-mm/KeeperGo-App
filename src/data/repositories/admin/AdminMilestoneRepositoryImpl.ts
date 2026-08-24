import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { AdminMilestoneRepository } from '../../../domain/repositories/admin/AdminMilestoneRepository';
import { MilestoneEntity } from '../../../domain/entities/mascota/Milestone';

const COLLECTION = 'milestones';

export class AdminMilestoneRepositoryImpl implements AdminMilestoneRepository {
  async getAllMilestones(): Promise<MilestoneEntity[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MilestoneEntity));
  }

  async createMilestone(days: number, label: string): Promise<void> {
    await addDoc(collection(db, COLLECTION), { days, label, createdAt: new Date().toISOString() });
  }

  async updateMilestone(id: string, days: number, label: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { days, label });
  }

  async deleteMilestone(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }
}