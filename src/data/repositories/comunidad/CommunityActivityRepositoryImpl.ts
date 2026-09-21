import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { CommunityActivityRepository } from '../../../domain/repositories/comunidad/CommunityActivityRepository';
import { CommunityActivityEntity } from '../../../domain/entities/comunidad/CommunityActivity';

function activityFromSnapshot(snapshot: QueryDocumentSnapshot<DocumentData>): CommunityActivityEntity {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    title: data.title,
    description: data.description,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    createdBy: data.createdBy,
    participants: data.participants ?? [],
  };
}

export class CommunityActivityRepositoryImpl implements CommunityActivityRepository {
  private activitiesCollection(communityId: string) {
    return collection(db, 'communities', communityId, 'activities');
  }

  private activityDocRef(communityId: string, activityId: string) {
    return doc(db, 'communities', communityId, 'activities', activityId);
  }

  async getActivities(communityId: string): Promise<CommunityActivityEntity[]> {
    const activitiesQuery = query(this.activitiesCollection(communityId), orderBy('startDate', 'asc'));
    const snapshot = await getDocs(activitiesQuery);
    return snapshot.docs.map(activityFromSnapshot);
  }

  async createActivity(
    communityId: string,
    createdBy: string,
    title: string,
    description: string,
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    const activityRef = await addDoc(this.activitiesCollection(communityId), {
      title,
      description,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      createdBy,
      participants: [],
    });
    return activityRef.id;
  }

  async setActivityParticipation(
    communityId: string,
    activityId: string,
    uid: string,
    isParticipating: boolean
  ): Promise<void> {
    await updateDoc(this.activityDocRef(communityId, activityId), {
      participants: isParticipating ? arrayRemove(uid) : arrayUnion(uid),
    });
  }
}