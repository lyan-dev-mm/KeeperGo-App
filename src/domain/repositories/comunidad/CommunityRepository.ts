import { CommunityEntity, CreateCommunityInput } from '../../entities/comunidad/Community';
import {
  CommunityMemberEntity,
  CommunityJoinRequestEntity,
} from '../../entities/comunidad/CommunityMember';

export interface CommunityRepository {
  createCommunity(input: CreateCommunityInput, createdBy: string): Promise<string>;
  getCommunities(): Promise<CommunityEntity[]>;
  getCommunityById(communityId: string): Promise<CommunityEntity | null>;
  getMembership(communityId: string, uid: string): Promise<CommunityMemberEntity | null>;
  joinCommunity(communityId: string, uid: string): Promise<void>;
  leaveCommunity(communityId: string, uid: string): Promise<void>;
  deleteCommunity(communityId: string): Promise<void>;
  requestToJoinCommunity(communityId: string, uid: string, userName: string): Promise<void>;
  getPendingJoinRequests(communityId: string): Promise<CommunityJoinRequestEntity[]>;
  acceptJoinRequest(communityId: string, uid: string): Promise<void>;
  rejectJoinRequest(communityId: string, uid: string): Promise<void>;
  getUserJoinRequest(communityId: string, userId: string): Promise<CommunityJoinRequestEntity | null>;
  getUserCommunities(userId: string): Promise<CommunityEntity[]>;
  getCommunityMembers(communityId: string): Promise<CommunityMemberEntity[]>;
getOwnedCommunitiesWithPendingRequests(userId: string): Promise<{
  communityId: string;
  communityName: string;
  requests: CommunityJoinRequestEntity[];
}[]>;
}