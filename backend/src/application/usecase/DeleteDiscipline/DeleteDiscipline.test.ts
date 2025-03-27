import { disciplineMock } from "../../../tests/mocks/disciplineMock"
import { DeleteDiscipline } from "./DeleteDiscipline"
import { GetDisciplines } from "../GetDisciplines/GetDisciplines"
import { DisciplineRepository } from "../../repository/DisciplineRepository"
import { DatabaseConnection } from "../../../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../../../infra/database/TestDatabaseAdapter"
import { DisciplineRepositoryDatabase } from "../../../infra/repository/DisciplineRepositoryDatabase"
import { faker } from "@faker-js/faker"

describe("DeleteDiscipline", () => {
  let connection: DatabaseConnection
  let disciplineRepository: DisciplineRepository
  let deleteDiscipline: DeleteDiscipline
  let getDisciplines: GetDisciplines

  beforeAll(() => {
    connection = getTestDatabaseAdapter()
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    deleteDiscipline = new DeleteDiscipline(disciplineRepository)
    getDisciplines = new GetDisciplines(disciplineRepository)
  })

  beforeEach(async () => {
    await connection.clear(["disciplines"])
  })

  afterAll(() => {
    connection.close()
  })

  it("should delete a discipline", async () => {
    const discipline = disciplineMock()
    await disciplineRepository.save(discipline)
    expect(await getDisciplines.execute()).toHaveLength(1)
    await deleteDiscipline.execute(discipline.disciplineId)
    const disciplines = await getDisciplines.execute({ showAll: true })
    expect(disciplines).toHaveLength(1)
    expect(disciplines[0].isActive).toBe(false)
    expect(disciplines[0].updatedAt).not.toEqual(discipline.createdAt)
  })

  it("should throw an error if the discipline is not found", async () => {
    const nonExistentDisciplineId = faker.string.uuid()
    await expect(deleteDiscipline.execute(nonExistentDisciplineId)).rejects.toThrow(
      `Discipline ID:${nonExistentDisciplineId} does not exist!`
    )
  })
})
