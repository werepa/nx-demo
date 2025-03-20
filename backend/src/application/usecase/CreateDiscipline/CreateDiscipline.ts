import { DisciplineRepository } from "../../repository"
import { Discipline } from "../../../domain/entity"

export class CreateDiscipline {
  constructor(private readonly disciplineRepository: DisciplineRepository) {}

  async execute(dto: Input): Promise<Discipline | null> {
    await this.checkIfDisciplineExists(dto.name)
    const discipline = Discipline.create(dto)
    await this.disciplineRepository.save(discipline)
    return this.disciplineRepository.getById(discipline.disciplineId)
  }

  private async checkIfDisciplineExists(name: string): Promise<void> {
    const disciplineExistente = await this.disciplineRepository.getByName(name)
    if (disciplineExistente) {
      throw new Error(`Discipline: "${name}" already exists!`)
    }
  }
}

export type Input = {
  name: string
}
