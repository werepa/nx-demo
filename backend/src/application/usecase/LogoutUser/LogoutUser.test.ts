import { DatabaseConnection } from "../../../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../../../infra/database/TestDatabaseAdapter"
import { UserRepository } from "../../repository/UserRepository"
import { UserRepositoryDatabase } from "../../../infra/repository/UserRepositoryDatabase"
import { LogoutUser } from "./LogoutUser"

describe("Usecase => LogoutUser", () => {
  let connection: DatabaseConnection
  let userRepository: UserRepository
  let logoutUser: LogoutUser

  beforeEach(async () => {
    connection = getTestDatabaseAdapter()

    userRepository = new UserRepositoryDatabase(connection)
    logoutUser = new LogoutUser(userRepository)

    await connection.clear(["users"])
  })

  afterEach(() => {
    connection.close()
  })

  it("should throw an error if the token is invalid", async () => {
    const invalidToken = "invalid_token"
    await userRepository.invalidateToken(invalidToken)
    await expect(logoutUser.execute(invalidToken)).rejects.toThrow("Invalid token")
  })
})
