import { Timestamp } from 'firebase/firestore';

export interface CommunityPostEntity {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  text: string;
  likeCount: number;
  likedBy: string[];
  createdAt: Timestamp | null;
}

export interface CommunityPostReplyEntity {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Timestamp | null;
}