import { UserEntity } from '../entities/User';

export interface AuthRepository {
  login(email: string, password: string): Promise<UserEntity | null>;
  register(email: string, password: string, fullName?: string): Promise<UserEntity | null>;
  logout(): Promise<void>;
  setRememberMe(value: boolean): Promise<void>;
  getRememberMe(): Promise<boolean>;
  sendVerificationEmail(): Promise<void>;
  reloadCurrentUser(): Promise<UserEntity | null>;
  isAccountDisabled(uid: string): Promise<boolean>;
}