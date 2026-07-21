import { AuthRepository } from '../repositories/AuthRepository';
import { UserEntity } from '../entities/User';

export class RegisterUseCase {
  constructor(private repository: AuthRepository) {}

  execute(email: string, password: string, fullName?: string): Promise<UserEntity | null> {
    return this.repository.register(email, password, fullName);
  }
}