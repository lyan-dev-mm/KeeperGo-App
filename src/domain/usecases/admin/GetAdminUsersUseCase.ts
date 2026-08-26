import { AdminUserRepository } from '../../repositories/admin/AdminUserRepository';

export class GetAdminUsersUseCase {
  constructor(private repository: AdminUserRepository) {}

  execute() {
    return this.repository.getAllUsers();
  }
}