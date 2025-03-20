import { UserRepository } from '../../repository/UserRepository';
import { User } from '../../../domain/entity/User';

export class GetUserById {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId: string): Promise<User | null> {
    this.validateUserId(userId);
    return await this.findUserById(userId);
  }

  private validateUserId(userId: string): void {
    if (!userId) {
      throw new Error('User ID is required');
    }
  }

  private async findUserById(userId: string): Promise<User | null> {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error(`User ID:${userId} does not exist!`);
    }
    return user;
  }
}
