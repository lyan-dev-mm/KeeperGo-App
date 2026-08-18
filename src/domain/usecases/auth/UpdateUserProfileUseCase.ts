import { UserProfileRepository } from '../../repositories/auth/UserProfileRepository';
import { UserProfileEntity } from '../../entities/auth/UserProfile';

export class UpdateUserProfileUseCase {
  constructor(private repository: UserProfileRepository) {}

  execute(uid: string, data: Partial<UserProfileEntity>): Promise<void> {
    return this.repository.updateUserProfile(uid, data);
  }
}