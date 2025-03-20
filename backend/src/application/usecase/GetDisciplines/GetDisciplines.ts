import { DisciplineRepository } from '../../repository/DisciplineRepository';
import { Discipline } from '../../../domain/entity/Discipline';

export class GetDisciplines {
  constructor(private readonly disciplineRepository: DisciplineRepository) {}

  async execute(
    { search, showAll }: { search?: string; showAll?: boolean } = {
      search: null,
      showAll: false,
    }
  ): Promise<Discipline[]> {
    return this.disciplineRepository.getAll({ search, showAll });
  }
}
