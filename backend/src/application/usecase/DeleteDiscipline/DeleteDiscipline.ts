import { UseCase } from '../../../shared/domain/entity/UseCase';
import { DisciplineRepository } from '../../repository/DisciplineRepository';

export class DeleteDiscipline implements UseCase {
  constructor(private readonly disciplineRepository: DisciplineRepository) {}

  async execute(disciplineId: string): Promise<void> {
    await this.validateDisciplineExists(disciplineId);
    await this.disciplineRepository.delete(disciplineId);
  }

  private async validateDisciplineExists(disciplineId: string): Promise<void> {
    const discipline = await this.disciplineRepository.getById(disciplineId);
    if (!discipline) {
      throw new Error(`Discipline ID:${disciplineId} does not exist!`);
    }
  }
}
