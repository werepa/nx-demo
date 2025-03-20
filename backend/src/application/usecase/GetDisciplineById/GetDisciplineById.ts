import { DisciplineRepository } from '../../repository/DisciplineRepository';
import { Discipline } from '../../../domain/entity/Discipline';

export class GetDisciplineById {
  constructor(private readonly disciplineRepository: DisciplineRepository) {}

  async execute(disciplineId: string): Promise<Discipline | null> {
    this.validateDisciplineId(disciplineId);
    return await this.findDisciplineById(disciplineId);
  }

  private validateDisciplineId(disciplineId: string): void {
    if (!disciplineId) {
      throw new Error('Discipline ID is required');
    }
  }

  private async findDisciplineById(
    disciplineId: string
  ): Promise<Discipline | null> {
    const discipline = await this.disciplineRepository.getById(disciplineId);
    if (!discipline) {
      throw new Error(`Discipline ID:${disciplineId} does not exist!`);
    }
    return discipline;
  }
}
