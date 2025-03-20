import request from "supertest"
import { AuthController } from "../../infra/http/controller"
import { CreateUser, LoginUser, LogoutUser } from "../../application/usecase"
import {
  DatabaseConnection,
  getTestDatabaseAdapter,
} from "../../infra/database"
import { UserRepositoryDatabase } from "../../infra/repository"
import app from "../../main_api"
import { faker } from "@faker-js/faker/."

describe("Auth Integration Tests", () => {
  let connection: DatabaseConnection
  let userRepository: UserRepositoryDatabase
  let createUser: CreateUser
  let loginUser: LoginUser
  let logoutUser: LogoutUser

  beforeEach(async () => {
    connection = getTestDatabaseAdapter()
    userRepository = new UserRepositoryDatabase(connection)
    await userRepository.clear()

    createUser = new CreateUser(userRepository)
    loginUser = new LoginUser(userRepository)
    logoutUser = new LogoutUser(userRepository)
    new AuthController(app, createUser, loginUser, logoutUser)
  })

  afterEach(async () => {
    await connection.close()
  })

  test("should register a new user", async () => {
    const newUser = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    const response = await request(app).post("/api/auth/register").send(newUser)
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("userId")
    expect(response.body).toHaveProperty("name", newUser.name)
    expect(response.body).toHaveProperty("email", newUser.email)
  })

  test("should login an user", async () => {
    const user = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    let response = await request(app).post("/api/auth/register").send(user)
    expect(response.status).toBe(201)
    response = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password })
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("user")
    expect(response.body.user).toHaveProperty("name", user.name)
    expect(response.body.user).toHaveProperty("email", user.email)
    expect(response.body).toHaveProperty("token")
  })

  test("should logout a user", async () => {
    const newUser = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    await request(app).post("/api/auth/register").send(newUser)

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: newUser.password })
    const token = loginResponse.body.token

    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`)
    expect(logoutResponse.status).toBe(200)
  })

  test("should throw an error if token is invalid on logout", async () => {
    const newUser = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    await request(app).post("/api/auth/register").send(newUser)

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: newUser.password })
    const token = loginResponse.body.token

    let logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`)
    expect(logoutResponse.status).toBe(200)

    logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`)
    expect(logoutResponse.status).toBe(400)
    expect(logoutResponse.body).toHaveProperty("error", "Invalid token")
  })
})
