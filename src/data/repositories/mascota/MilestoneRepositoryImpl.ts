import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { MilestoneRepository } from '../../../domain/repositories/mascota/MilestoneRepository';
import { MilestoneEntity } from '../../../domain/entities/mascota/Milestone';

const COLLECTION = 'milestones';

export class MilestoneRepositoryImpl implements MilestoneRepository {
  async getAllMilestones(): Promise<MilestoneEntity[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MilestoneEntity));
  }
}