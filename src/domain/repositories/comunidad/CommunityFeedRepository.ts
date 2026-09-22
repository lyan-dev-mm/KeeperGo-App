import { CommunityPostEntity, CommunityPostReplyEntity } from '../../entities/comunidad/CommunityPost';

export interface CommunityFeedRepository {
  getRecentPosts(communityId: string): Promise<CommunityPostEntity[]>;
  getFeaturedPosts(communityId: string): Promise<CommunityPostEntity[]>;
  createPost(
    communityId: string,
    authorId: string,
    authorName: string,
    authorColor: string,
    text: string
  ): Promise<string>;
  toggleLikePost(communityId: string, postId: string, uid: string, isLiked: boolean): Promise<void>;
  updatePost(communityId: string, postId: string, newText: string): Promise<void>;
  deletePost(communityId: string, postId: string): Promise<void>;
  getReplies(communityId: string, postId: string): Promise<CommunityPostReplyEntity[]>;
  addReply(
    communityId: string,
    postId: string,
    authorId: string,
    authorName: string,
    text: string
  ): Promise<string>;
  updateReply(communityId: string, postId: string, replyId: string, newText: string): Promise<void>;
  deleteReply(communityId: string, postId: string, replyId: string): Promise<void>;
}