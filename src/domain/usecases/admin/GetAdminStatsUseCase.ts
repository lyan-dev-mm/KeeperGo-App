import { AdminUserRepository } from '../../repositories/admin/AdminUserRepository';
import { AdminMessageRepository } from '../../repositories/admin/AdminMessageRepository';
import { AdminStats } from '../../entities/admin/AdminStats';

export class GetAdminStatsUseCase {
  constructor(
    private userRepository: AdminUserRepository,
    private messageRepository: AdminMessageRepository
  ) {}

  async execute(): Promise<AdminStats> {
    const [users, messages] = await Promise.all([
      this.userRepository.getAllUsers(),
      this.messageRepository.getAllMessages(),
    ]);

    const totalUsers = users.length;
    const streaks = users.map((u) => u.currentStreak ?? 0);
    const levels = users.map((u) => u.level ?? 1);

    const averageStreak = totalUsers > 0 ? streaks.reduce((a, b) => a + b, 0) / totalUsers : 0;
    const averageLevel = totalUsers > 0 ? levels.reduce((a, b) => a + b, 0) / totalUsers : 0;
    const totalActiveMessages = messages.filter((m) => m.active).length;

    return {
      totalUsers,
      averageStreak: Math.round(averageStreak * 10) / 10,
      averageLevel: Math.round(averageLevel * 10) / 10,
      totalActiveMessages,
    };
  }
}