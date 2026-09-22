import { Timestamp } from 'firebase/firestore';

export type CommunityMemberRole = 'owner' | 'member';

export interface CommunityMemberEntity {
  uid: string;
  role: CommunityMemberRole;
  userName: string | null;   // <-- NUEVO
  userColor: string | null;  // <-- NUEVO
  joinedAt: Timestamp | null;
}

export type JoinRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface CommunityJoinRequestEntity {
  uid: string;
  userName: string;
  status: JoinRequestStatus;
  requestedAt: Timestamp | null;
}