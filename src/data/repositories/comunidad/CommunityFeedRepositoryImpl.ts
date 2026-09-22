import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  writeBatch,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebaseConfig';
import { CommunityFeedRepository } from '../../../domain/repositories/comunidad/CommunityFeedRepository';
import { CommunityPostEntity, CommunityPostReplyEntity } from '../../../domain/entities/comunidad/CommunityPost';

// A partir de cuántos "me gusta" una publicación entra a Destacados.
const FEATURED_LIKE_THRESHOLD = 5;

function postFromSnapshot(snapshot: QueryDocumentSnapshot<DocumentData>): CommunityPostEntity {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    authorId: data.authorId,
    authorName: data.authorName,
    authorColor: data.authorColor,
    text: data.text,
    likeCount: data.likeCount ?? 0,
    likedBy: data.likedBy ?? [],
    createdAt: data.createdAt ?? null,
  };
}

export class CommunityFeedRepositoryImpl implements CommunityFeedRepository {
  private postsCollection(communityId: string) {
    return collection(db, 'communities', communityId, 'posts');
  }

  private postDocRef(communityId: string, postId: string) {
    return doc(db, 'communities', communityId, 'posts', postId);
  }

  private repliesCollection(communityId: string, postId: string) {
    return collection(db, 'communities', communityId, 'posts', postId, 'replies');
  }

  async getRecentPosts(communityId: string): Promise<CommunityPostEntity[]> {
    const postsQuery = query(this.postsCollection(communityId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map(postFromSnapshot);
  }

  async getFeaturedPosts(communityId: string): Promise<CommunityPostEntity[]> {
    const featuredQuery = query(
      this.postsCollection(communityId),
      where('likeCount', '>=', FEATURED_LIKE_THRESHOLD),
      orderBy('likeCount', 'desc')
    );
    const snapshot = await getDocs(featuredQuery);
    return snapshot.docs.map(postFromSnapshot);
  }

  async createPost(
    communityId: string,
    authorId: string,
    authorName: string,
    authorColor: string,
    text: string
  ): Promise<string> {
    const postRef = await addDoc(this.postsCollection(communityId), {
      authorId,
      authorName,
      authorColor,
      text,
      likeCount: 0,
      likedBy: [],
      createdAt: serverTimestamp(),
    });
    return postRef.id;
  }

  async toggleLikePost(
    communityId: string,
    postId: string,
    uid: string,
    isLiked: boolean
  ): Promise<void> {
    await updateDoc(this.postDocRef(communityId, postId), {
      likeCount: increment(isLiked ? -1 : 1),
      likedBy: isLiked ? arrayRemove(uid) : arrayUnion(uid),
    });
  }

  async updatePost(communityId: string, postId: string, newText: string): Promise<void> {
    await updateDoc(this.postDocRef(communityId, postId), {
      text: newText,
      editedAt: serverTimestamp(),
    });
  }

  async deletePost(communityId: string, postId: string): Promise<void> {
    // Las respuestas viven en una subcolección, así que hay que borrarlas primero
    // dentro de un batch. Si no, quedarían huérfanas en Firestore.
    const batch = writeBatch(db);

    const repliesSnapshot = await getDocs(this.repliesCollection(communityId, postId));
    repliesSnapshot.docs.forEach((replyDoc) => {
      batch.delete(replyDoc.ref);
    });

    batch.delete(this.postDocRef(communityId, postId));

    await batch.commit();
  }

  async getReplies(communityId: string, postId: string): Promise<CommunityPostReplyEntity[]> {
    const repliesQuery = query(this.repliesCollection(communityId, postId), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(repliesQuery);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        authorId: data.authorId,
        authorName: data.authorName,
        text: data.text,
        createdAt: data.createdAt ?? null,
      };
    });
  }

  async addReply(
    communityId: string,
    postId: string,
    authorId: string,
    authorName: string,
    text: string
  ): Promise<string> {
    const replyRef = await addDoc(this.repliesCollection(communityId, postId), {
      authorId,
      authorName,
      text,
      createdAt: serverTimestamp(),
    });
    return replyRef.id;
  }
    async updateReply(
    communityId: string,
    postId: string,
    replyId: string,
    newText: string
  ): Promise<void> {
    const replyRef = doc(db, 'communities', communityId, 'posts', postId, 'replies', replyId);
    await updateDoc(replyRef, {
      text: newText,
      editedAt: serverTimestamp(),
    });
  }

  async deleteReply(communityId: string, postId: string, replyId: string): Promise<void> {
    const replyRef = doc(db, 'communities', communityId, 'posts', postId, 'replies', replyId);
    await deleteDoc(replyRef);
  }
}