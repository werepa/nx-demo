import { UserRepository } from "../../application/repository/UserRepository"
import { User } from "../../domain/entity/User"
import { userMock } from "../../tests/mocks"
import { UserRepositoryDatabase } from "./UserRepositoryDatabase"
import { DatabaseConnection, getTestDatabaseAdapter } from "../database"

describe("UserRepositoryDatabase", () => {
  let connection: DatabaseConnection
  let userRepository: UserRepository

  beforeAll(() => {
    connection = getTestDatabaseAdapter()
    userRepository = new UserRepositoryDatabase(connection)
  })

  beforeEach(async () => {
    await connection.clear(["users"])
  })

  afterAll(async () => {
    await connection.close()
  })

  describe("User", () => {
    test("should save a new user", async () => {
      const user = userMock()
      await userRepository.save(user)
      const savedUser: User = await userRepository.getById(user.userId)
      expect(savedUser).toEqual(user)
    })

    test("should return a user by id", async () => {
      const user = userMock()

      await userRepository.save(user)
      const foundUser = await userRepository.getById(user.userId)
      expect(foundUser?.toDTO()).toEqual(user.toDTO())
    })

    test("should return a user by email", async () => {
      const user = userMock()
      await userRepository.save(user)
      const foundUser: User = await userRepository.getByEmail(user.email)
      expect(foundUser).toEqual(user)
    })

    test("should return all users", async () => {
      const user1 = userMock({ name: "User 1" })
      const user2 = userMock({ name: "User 2" })
      const user3 = userMock({ name: "User 3" })
      const user4 = userMock({ name: "User 4" })
      user4.deactivate()
      await userRepository.save(user3)
      await userRepository.save(user4)
      await userRepository.save(user1)
      await userRepository.save(user2)
      const activeUsers = [user1, user2, user3].sort((a, b) => a.name.localeCompare(b.name))
      const allUsers = [user1, user2, user3, user4].sort((a, b) => a.name.localeCompare(b.name))
      const result1 = await userRepository.getAll()
      expect(result1).toEqual(activeUsers)
      const result2 = await userRepository.getAll({ showAll: true })
      expect(result2).toEqual(allUsers)
    })

    test("should update an existing user", async () => {
      const user = userMock()
      await userRepository.save(user)
      const updatedName = "Updated Name"
      user.updateName(updatedName)
      await userRepository.save(user)
      const updatedUser = await userRepository.getById(user.userId)
      expect(updatedUser?.name).toBe(updatedName)
    })
  })

  describe("Token Management", () => {
    test("should consider tokens valid by default", async () => {
      const token = "new_token"
      const isValid = await userRepository.isTokenValid(token)
      expect(isValid).toBe(true)
    })

    test("should invalidate tokens", async () => {
      const token = "valid_token"
      // First verify token is valid
      expect(await userRepository.isTokenValid(token)).toBe(true)
      // Invalidate it
      await userRepository.invalidateToken(token)
      // Verify it's now invalid
      expect(await userRepository.isTokenValid(token)).toBe(false)
    })
  })
})
