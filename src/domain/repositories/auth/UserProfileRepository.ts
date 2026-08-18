import { UserProfileEntity } from '../../entities/auth/UserProfile';

export interface UserProfileRepository {
  createUserProfile(profile: UserProfileEntity): Promise<void>;
  getUserProfile(uid: string): Promise<UserProfileEntity | null>;
  updateUserProfile(uid: string, data: Partial<UserProfileEntity>): Promise<void>;
}