import { DatabaseConnection } from "../../../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../../../infra/database/TestDatabaseAdapter"
import { GetUserByEmail } from "./GetUserByEmail"
import { userMock } from "../../../tests/mocks"
import { UserRepository } from "../../repository/UserRepository"
import { UserRepositoryDatabase } from "../../../infra/repository/UserRepositoryDatabase"

describe("GetUserByEmail", () => {
  let connection: DatabaseConnection
  let userRepository: UserRepository
  let getUserByEmail: GetUserByEmail

  beforeAll(() => {
    connection = getTestDatabaseAdapter()
    userRepository = new UserRepositoryDatabase(connection)
    getUserByEmail = new GetUserByEmail(userRepository)
  })

  beforeEach(async () => {
    await connection.clear(["users"])
  })

  afterAll(async () => {
    await connection.close()
  })

  it("should return the user when found by email", async () => {
    const user = userMock()
    await userRepository.save(user)
    const userSaved = await getUserByEmail.execute(user.email)
    expect(userSaved).toEqual(user)
  })

  it("should throw error when the user is not found by email", async () => {
    const email = "any_email"
    await expect(getUserByEmail.execute(email)).rejects.toThrow(`User with email: "${email}" does not exist!`)
  })
})
