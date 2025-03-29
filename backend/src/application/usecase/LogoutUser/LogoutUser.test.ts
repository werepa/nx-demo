import { DatabaseConnection } from "../../../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../../../infra/database/TestDatabaseAdapter"
import { UserRepository } from "../../repository/UserRepository"
import { UserRepositoryDatabase } from "../../../infra/repository/UserRepositoryDatabase"
import { LogoutUser } from "./LogoutUser"

describe("Usecase => LogoutUser", () => {
  let connection: DatabaseConnection
  let userRepository: UserRepository
  let logoutUser: LogoutUser

  beforeAll(() => {
    connection = getTestDatabaseAdapter()
    userRepository = new UserRepositoryDatabase(connection)
    logoutUser = new LogoutUser(userRepository)
  })

  beforeEach(async () => {
    await connection.clear(["users"])
  })

  afterAll(async () => {
    await connection.close()
  })

  it("should throw an error if the token is invalid", async () => {
    const invalidToken = "invalid_token"
    await userRepository.invalidateToken(invalidToken)
    await expect(logoutUser.execute(invalidToken)).rejects.toThrow("Invalid token")
  })
})
