import { AdminUserSummary } from '../../entities/admin/AdminUserSummary';

export interface AdminUserRepository {
  getAllUsers(): Promise<AdminUserSummary[]>;
  setUserDisabled(uid: string, disabled: boolean): Promise<void>;
  deleteUserData(uid: string): Promise<void>;
}