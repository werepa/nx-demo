import { Discipline } from "../../domain/entity/Discipline"

export interface DisciplineRepository {
  save(discipline: Discipline): Promise<void>
  getById(disciplineId: string): Promise<Discipline | null>
  getByName(name: string): Promise<Discipline | null>
  getAll({ search, showAll }?: { search?: string; showAll?: boolean }): Promise<Discipline[]>
  delete(id: string): Promise<void>
}
