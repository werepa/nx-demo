import { DisciplineRepository } from '../../repository/DisciplineRepository';
import { LearningRepository } from '../../repository/LearningRepository';
import { UserRepository } from '../../repository/UserRepository';
import { Discipline } from '../../../domain/entity/Discipline';
import { Learning } from '../../../domain/entity/Learning';
import { User } from '../../../domain/entity/User';

export class GetLearning {
  private discipline: Discipline;
  private user: User;

  constructor(
    private disciplineRepository: DisciplineRepository,
    private userRepository: UserRepository,
    private learningRepository: LearningRepository
  ) {}

  async execute(dto: Input): Promise<Learning> {
    this.user = await this.validateUser(dto.userId);
    this.discipline = await this.validateDiscipline(dto.disciplineId);
    return await this.learningRepository.getDisciplineLearning(
      this.user,
      this.discipline
    );
  }

  private async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error(`User ID:${userId} does not exist!`);
    }
    return user;
  }

  private async validateDiscipline(disciplineId: string): Promise<Discipline> {
    const discipline = await this.disciplineRepository.getById(disciplineId);
    if (!discipline) {
      throw new Error(`Discipline ID:${disciplineId} does not exist!`);
    }
    return discipline;
  }
}

type Input = {
  disciplineId: string;
  userId: string;
};
