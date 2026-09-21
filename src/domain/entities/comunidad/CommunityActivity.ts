import { Timestamp } from 'firebase/firestore';

export interface CommunityActivityEntity {
  id: string;
  title: string;
  description: string;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  createdBy: string;
  participants: string[];
}