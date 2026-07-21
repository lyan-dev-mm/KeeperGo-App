import { AuthRepository } from '../repositories/AuthRepository';
import { UserEntity } from '../entities/User';

export class LoginUseCase {
  constructor(private repository: AuthRepository) {}

  execute(email: string, password: string): Promise<UserEntity | null> {
    return this.repository.login(email, password);
  }
}