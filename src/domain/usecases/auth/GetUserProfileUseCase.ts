import { UserProfileRepository } from '../../repositories/auth/UserProfileRepository';
import { UserProfileEntity } from '../../entities/auth/UserProfile';

export class GetUserProfileUseCase {
  constructor(private repository: UserProfileRepository) {}

  execute(uid: string): Promise<UserProfileEntity | null> {
    return this.repository.getUserProfile(uid);
  }
}