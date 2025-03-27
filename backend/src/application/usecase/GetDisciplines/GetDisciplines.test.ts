import { Discipline } from "../../../domain/entity/Discipline"
import { DatabaseConnection, getTestDatabaseAdapter } from "../../../infra/database"
import { DisciplineRepositoryDatabase } from "../../../infra/repository"
import { disciplineMock } from "../../../tests/mocks"
import { GetDisciplines } from "./GetDisciplines"

describe("Usecase => GetDisciplines", () => {
  let connection: DatabaseConnection
  let getDisciplines: GetDisciplines

  beforeEach(() => {
    connection = getTestDatabaseAdapter()
    const disciplineRepository = new DisciplineRepositoryDatabase(connection)
    getDisciplines = new GetDisciplines(disciplineRepository)
  })

  beforeEach(async () => {
    await connection.clear(["disciplines"])
  })

  afterAll(() => {
    connection.close()
  })

  test("should return an empty array when no disciplines exist", async () => {
    const disciplines = await getDisciplines.execute()
    expect(disciplines).toHaveLength(0)
  })

  test("should return only active disciplines", async () => {
    const discipline1 = disciplineMock({ name: "Discipline 1" })
    const discipline2 = disciplineMock({ name: "Discipline 2" })
    const discipline3 = disciplineMock({ name: "Discipline 3" })
    discipline3.deactivate()

    const disciplineRepository = new DisciplineRepositoryDatabase(connection)
    await disciplineRepository.save(discipline1)
    await disciplineRepository.save(discipline2)
    await disciplineRepository.save(discipline3)

    const disciplines = await getDisciplines.execute()
    expect(disciplines).toHaveLength(2)
    expect(disciplines[0].name).toBe("Discipline 1")
    expect(disciplines[1].name).toBe("Discipline 2")
  })

  test("should return all disciplines when showAll is true", async () => {
    const discipline1 = disciplineMock({ name: "Discipline 1" })
    const discipline2 = disciplineMock({ name: "Discipline 2" })
    const discipline3 = disciplineMock({ name: "Discipline 3" })
    discipline3.deactivate()

    const disciplineRepository = new DisciplineRepositoryDatabase(connection)
    await disciplineRepository.save(discipline1)
    await disciplineRepository.save(discipline2)
    await disciplineRepository.save(discipline3)

    const disciplines = await getDisciplines.execute({ showAll: true })
    expect(disciplines).toHaveLength(3)
  })
})
