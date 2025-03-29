import { disciplineMock } from "../../../tests/mocks/disciplineMock"
import { GetDisciplineById } from "./GetDisciplineById"
import { DisciplineRepository } from "../../repository/DisciplineRepository"
import { DatabaseConnection } from "../../../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../../../infra/database/TestDatabaseAdapter"
import { DisciplineRepositoryDatabase } from "../../../infra/repository/DisciplineRepositoryDatabase"
import { faker } from "@faker-js/faker"

describe("Usecases => GetDisciplineById", () => {
  let connection: DatabaseConnection
  let disciplineRepository: DisciplineRepository
  let getDisciplineById: GetDisciplineById

  beforeAll(() => {
    connection = getTestDatabaseAdapter()
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    getDisciplineById = new GetDisciplineById(disciplineRepository)
  })

  beforeEach(async () => {
    await connection.clear(["topics", "disciplines"])
  })

  afterAll(async () => {
    await connection.close()
  })

  test("should return the correct discipline when the ID is valid", async () => {
    const discipline = disciplineMock()
    await disciplineRepository.save(discipline)
    const disciplineSaved = await disciplineRepository.getById(discipline.disciplineId)
    expect(disciplineSaved).toEqual(discipline)
  })

  test("should throw an error when the discipline ID is empty", async () => {
    const disciplineId = ""
    await expect(getDisciplineById.execute(disciplineId)).rejects.toThrow("Discipline ID is required")
  })

  it("should return NotFound Error if id does not exist!", async () => {
    const nonExistentDisciplineId = faker.string.uuid()
    await expect(getDisciplineById.execute(nonExistentDisciplineId)).rejects.toThrow(
      `Discipline ID:${nonExistentDisciplineId} does not exist!`
    )
  })
})
