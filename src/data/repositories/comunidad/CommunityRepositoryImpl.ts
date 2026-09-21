import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  collectionGroup,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { CommunityRepository } from '../../../domain/repositories/comunidad/CommunityRepository';
import { CommunityEntity, CreateCommunityInput } from '../../../domain/entities/comunidad/Community';
import { CommunityMemberEntity, CommunityJoinRequestEntity } from '../../../domain/entities/comunidad/CommunityMember';

const COMMUNITIES_COLLECTION = 'communities';

function communityFromSnapshot(snapshot: QueryDocumentSnapshot<DocumentData>): CommunityEntity {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name,
    description: data.description,
    category: data.category ?? undefined,
    visibility: data.visibility,
    coverImage: data.coverImage ?? null,
    color: data.color,
    rules: data.rules ?? [],
    createdBy: data.createdBy,
    createdAt: data.createdAt ?? null,
    memberCount: data.memberCount ?? 0,
  };
}

export class CommunityRepositoryImpl implements CommunityRepository {
  private communitiesCollection() {
    return collection(db, COMMUNITIES_COLLECTION);
  }

  private communityDocRef(communityId: string) {
    return doc(db, COMMUNITIES_COLLECTION, communityId);
  }

  private memberDocRef(communityId: string, uid: string) {
    return doc(db, COMMUNITIES_COLLECTION, communityId, 'members', uid);
  }

  private joinRequestDocRef(communityId: string, uid: string) {
    return doc(db, COMMUNITIES_COLLECTION, communityId, 'joinRequests', uid);
  }

  async createCommunity(input: CreateCommunityInput, createdBy: string): Promise<string> {
    const communityRef = await addDoc(this.communitiesCollection(), {
      name: input.name,
      description: input.description,
      category: input.category ?? null,
      visibility: input.visibility,
      coverImage: input.coverImage,
      color: input.color,
      rules: input.rules,
      createdBy,
      createdAt: serverTimestamp(),
      memberCount: 1,
    });

    await setDoc(this.memberDocRef(communityRef.id, createdBy), {
      uid: createdBy, 
      role: 'owner',
      joinedAt: serverTimestamp(),
    });

    return communityRef.id;
  }

  async getCommunities(): Promise<CommunityEntity[]> {
    const communitiesQuery = query(this.communitiesCollection(), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(communitiesQuery);
    return snapshot.docs.map(communityFromSnapshot);
  }
    async getUserCommunities(userId: string): Promise<CommunityEntity[]> {
    // 1. Buscamos todos los docs de la subcolección "members" donde uid == userId
    const membersQuery = query(
      collectionGroup(db, 'members'),
      where('uid', '==', userId)
    );
    const membersSnapshot = await getDocs(membersQuery);

    // 2. De cada doc, sacamos el id de la comunidad padre
    const communityIds = membersSnapshot.docs
      .map((docSnap) => docSnap.ref.parent.parent?.id)
      .filter((id): id is string => !!id);

    if (communityIds.length === 0) return [];

    // 3. Traemos las comunidades en paralelo
    const communities = await Promise.all(
      communityIds.map((cid) => this.getCommunityById(cid))
    );

    return communities.filter((c): c is CommunityEntity => c !== null);
  }

  async getCommunityById(communityId: string): Promise<CommunityEntity | null> {
    const snapshot = await getDoc(this.communityDocRef(communityId));
    if (!snapshot.exists()) return null;
    return communityFromSnapshot(snapshot as QueryDocumentSnapshot<DocumentData>);
  }

  async getMembership(communityId: string, uid: string): Promise<CommunityMemberEntity | null> {
    const snapshot = await getDoc(this.memberDocRef(communityId, uid));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return { uid, role: data.role, joinedAt: data.joinedAt ?? null };
  }

 async joinCommunity(communityId: string, uid: string): Promise<void> {
  await setDoc(this.memberDocRef(communityId, uid), {
    uid: uid,  // <-- NUEVO
    role: 'member',
    joinedAt: serverTimestamp(),
  });
  await updateDoc(this.communityDocRef(communityId), { memberCount: increment(1) });
}

  async leaveCommunity(communityId: string, uid: string): Promise<void> {
    await deleteDoc(this.memberDocRef(communityId, uid));
    await updateDoc(this.communityDocRef(communityId), { memberCount: increment(-1) });
  }

  async requestToJoinCommunity(communityId: string, uid: string, userName: string): Promise<void> {
    await setDoc(this.joinRequestDocRef(communityId, uid), {
      userName,
      status: 'pending',
      requestedAt: serverTimestamp(),
    });
  }

  async getPendingJoinRequests(communityId: string): Promise<CommunityJoinRequestEntity[]> {
    const requestsQuery = query(
      collection(db, COMMUNITIES_COLLECTION, communityId, 'joinRequests'),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(requestsQuery);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        userName: data.userName,
        status: data.status,
        requestedAt: data.requestedAt ?? null,
      };
    });
  }

  async acceptJoinRequest(communityId: string, uid: string): Promise<void> {
    await updateDoc(this.joinRequestDocRef(communityId, uid), { status: 'accepted' });
    await this.joinCommunity(communityId, uid);
  }

  async rejectJoinRequest(communityId: string, uid: string): Promise<void> {
    await updateDoc(this.joinRequestDocRef(communityId, uid), { status: 'rejected' });
  }
    async getUserJoinRequest(communityId: string, userId: string): Promise<CommunityJoinRequestEntity | null> {
    const snapshot = await getDoc(this.joinRequestDocRef(communityId, userId));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return {
      uid: userId,
      userName: data.userName,
      status: data.status,
      requestedAt: data.requestedAt ?? null,
    };
  }

  async getOwnedCommunitiesWithPendingRequests(userId: string) {
    const communitiesQuery = query(
      this.communitiesCollection(),
      where('createdBy', '==', userId)
    );
    const snapshot = await getDocs(communitiesQuery);
    
    const results: { communityId: string; communityName: string; requests: CommunityJoinRequestEntity[] }[] = [];
    
    for (const docSnap of snapshot.docs) {
      const requests = await this.getPendingJoinRequests(docSnap.id);
      if (requests.length > 0) {
        results.push({
          communityId: docSnap.id,
          communityName: docSnap.data().name,
          requests,
        });
      }
    }
    return results;
  }
    async deleteCommunity(communityId: string): Promise<void> {
    // Firestore NO borra subcolecciones automáticamente. Debemos borrarlas
    // manualmente en un batch antes de borrar el documento padre.
    const batch = writeBatch(db);

    // Subcolecciones a limpiar
    const subcollections = ['members', 'joinRequests', 'posts', 'activities'];

    for (const sub of subcollections) {
      const snapshot = await getDocs(
        collection(db, COMMUNITIES_COLLECTION, communityId, sub)
      );
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
    }

    // Borramos el documento principal
    batch.delete(this.communityDocRef(communityId));

    await batch.commit();
  }
}