import { Discipline } from "../../../domain/entity/Discipline"
import { CreateDiscipline } from "./CreateDiscipline"
import { disciplineMock } from "../../../tests/mocks/disciplineMock"
import { DatabaseConnection } from "../../../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../../../infra/database/TestDatabaseAdapter"
import { DisciplineRepository } from "../../repository/DisciplineRepository"
import { DisciplineRepositoryDatabase } from "../../../infra/repository/DisciplineRepositoryDatabase"

describe("Usecase => CreateDiscipline", () => {
  let connection: DatabaseConnection
  let disciplineRepository: DisciplineRepository
  let createDiscipline: CreateDiscipline

  beforeAll(() => {
    connection = getTestDatabaseAdapter()
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    createDiscipline = new CreateDiscipline(disciplineRepository)
  })

  beforeEach(async () => {
    await connection.clear(["topics", "disciplines"])
  })

  afterAll(() => {
    connection.close()
  })

  it("should create a new discipline", async () => {
    const discipline = disciplineMock()
    const disciplineSaved = await createDiscipline.execute({
      name: discipline.name,
    })
    expect(disciplineSaved).toBeInstanceOf(Discipline)
    expect(disciplineSaved?.name).toBe(discipline.name)
  })

  it("should not create a discipline with an existing name", async () => {
    const discipline = disciplineMock()
    await createDiscipline.execute({ name: discipline.name })
    await expect(createDiscipline.execute({ name: discipline.name })).rejects.toThrow(
      `Discipline: "${discipline.name}" already exists!`
    )
  })
})
