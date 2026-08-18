import { UserProfileRepository } from '../../repositories/auth/UserProfileRepository';
import { UserProfileEntity } from '../../entities/auth/UserProfile';

export class CreateUserProfileUseCase {
  constructor(private repository: UserProfileRepository) {}

  execute(profile: UserProfileEntity): Promise<void> {
    return this.repository.createUserProfile(profile);
  }
}