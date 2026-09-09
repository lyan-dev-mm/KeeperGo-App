import { AdminUserRepository } from '../../repositories/admin/AdminUserRepository';

export class ManageUserAccountUseCase {
  constructor(private repository: AdminUserRepository) {}

  setDisabled(uid: string, disabled: boolean) {
    return this.repository.setUserDisabled(uid, disabled);
  }

  deleteUserData(uid: string) {
    return this.repository.deleteUserData(uid);
  }
}