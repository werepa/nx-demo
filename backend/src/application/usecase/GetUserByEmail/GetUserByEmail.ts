import { UserRepository } from '../../repository/UserRepository';
import { User } from '../../../domain/entity/User';

export class GetUserByEmail {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(email: string): Promise<User | null> {
    this.validateEmail(email);
    return await this.findUserByEmail(email);
  }

  private validateEmail(email: string): void {
    if (!email) {
      throw new Error('Email is required');
    }
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.getByEmail(email);
    if (!user) {
      throw new Error(`User with email: "${email}" does not exist!`);
    }
    return user;
  }
}
