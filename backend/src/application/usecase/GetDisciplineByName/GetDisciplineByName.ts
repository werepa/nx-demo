import { DisciplineRepository } from '../../repository/DisciplineRepository';
import { Discipline } from '../../../domain/entity/Discipline';

export class GetDisciplineByName {
  constructor(private readonly disciplineRepository: DisciplineRepository) {}

  async execute(name: string): Promise<Discipline | null> {
    this.validateDisciplineName(name);
    return await this.findDisciplineByName(name);
  }

  private validateDisciplineName(name: string): void {
    if (!name) {
      throw new Error('Discipline name is required');
    }
  }

  private async findDisciplineByName(name: string): Promise<Discipline | null> {
    const discipline = await this.disciplineRepository.getByName(name);
    if (!discipline) {
      throw new Error(`Discipline: "${name}" does not exist!`);
    }
    return discipline;
  }
}
