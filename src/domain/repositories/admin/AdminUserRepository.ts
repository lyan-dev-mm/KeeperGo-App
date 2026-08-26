import { AdminUserSummary } from '../../entities/admin/AdminUserSummary';

export interface AdminUserRepository {
  getAllUsers(): Promise<AdminUserSummary[]>;
}