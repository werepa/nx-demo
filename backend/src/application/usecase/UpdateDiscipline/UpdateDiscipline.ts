import { DisciplineRepository } from "../../repository"
import { Discipline } from "../../../domain/entity"
import { DisciplineState } from "../../../shared/models"

export class UpdateDiscipline {
  constructor(private readonly disciplineRepository: DisciplineRepository) {}

  async execute(dto: DisciplineState): Promise<Discipline | null> {
    const discipline = Discipline.toDomain(dto)
    await this.validateDisciplineExists(dto.disciplineId)
    await this.validateDisciplineNameUniqueness(discipline.name, discipline.disciplineId)
    await this.disciplineRepository.save(discipline)
    return this.disciplineRepository.getById(dto.disciplineId)
  }

  private async validateDisciplineExists(disciplineId: string): Promise<void> {
    const disciplineExists = await this.disciplineRepository.getById(disciplineId)
    if (!disciplineExists) {
      throw new Error(`Discipline ID:"${disciplineId}" does not exist!`)
    }
  }

  private async validateDisciplineNameUniqueness(name: string, disciplineId: string): Promise<void> {
    const disciplineNameExists = await this.disciplineRepository.getByName(name)
    if (disciplineNameExists && disciplineNameExists.disciplineId !== disciplineId) {
      throw new Error(`Discipline: "${name}" already exists!`)
    }
  }
}
