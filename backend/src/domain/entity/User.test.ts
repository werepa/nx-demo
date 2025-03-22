import { faker } from "@faker-js/faker"
import { userMockDTO } from "../../tests/mocks"
import { CreateUserCommand, User } from "."
import { UserPassword, UserRole } from "../valueObject"
import { UserState } from "../../shared/models"

describe("Entity => User", () => {
  describe("User properties", () => {
    test("should create a User instance with valid properties", () => {
      const props1: CreateUserCommand = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password({ length: 6 }),
      }
      const user1 = User.create(props1)
      expect(user1).toBeInstanceOf(User)
      expect(user1.role).toBe("Free")
      expect(user1.isActive).toBe(true)

      const props2: CreateUserCommand = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password({ length: 6 }),
      }
      const user2 = User.create(props2)
      expect(user2).toBeInstanceOf(User)
      expect(user2.id).toBeDefined()
      expect(user2.id).toHaveLength(36)
      expect(user2.role).toBe("Free")
      expect(user2.isActive).toBe(true)
    })

    test("should create a User instance with persistence data", () => {
      const userState: UserState = userSateMock()
      const user = User.toDomain(userState)
      expect(user).toBeInstanceOf(User)
      expect(user.userId).toBe(userState.userId)
      expect(user.name).toBe(userState.name)
      expect(user.email).toBe(userState.email)
      expect(user.password).toBe(userState.password)
      expect(user.role).toBe(userState.role)
      expect(user.image).toBe(userState.image)
      expect(user.isActive).toBe(userState.isActive)
      expect(user.createdAt.value).toBe(userState.createdAt)
      expect(user.updatedAt).toBeNull()
    })

    test("should throw an error when creating an instance without required properties", () => {
      // @ts-expect-error Testing the error missing required properties
      expect(() => User.create({})).toThrow("Missing required properties")
    })

    test("Password should have at least 6 characters", () => {
      expect(() => UserPassword.create("1234")).toThrow("Password must be at least 6 characters long")
    })

    test("Password should be encrypted", () => {
      const password = "12345678"
      const user = User.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: password,
      })
      expect(user.password).not.toBe(password)
    })

    test("should validate the password correctly", () => {
      const password = "12345678"
      const user = User.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: password,
      })

      expect(user.passwordValidate(password)).toBe(true)
      expect(user.passwordValidate("wrongPassword")).toBe(false)
    })

    test("should change the role correctly", () => {
      const user = User.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "123456",
      })
      const novoRole = UserRole.create("member")
      user.updateRole(novoRole)
      expect(user.role).toBe("Member")
    })

    test("should change the image correctly", () => {
      const user = User.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "123456",
      })

      const newImage = "newImageBase64"
      user.updateImage(newImage)

      expect(user.image).toBe(newImage)
    })

    test("should change the password correctly", () => {
      const user = User.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "123456",
      })
      const newPassword = "newPassword123"
      user.updatePassword(newPassword)
      expect(user.passwordValidate(newPassword)).toBe(true)
    })
  })
})
function userSateMock(): UserState {
  throw new Error("Function not implemented.")
}
