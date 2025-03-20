import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import {
  CheckQuizAnswer,
  CreateQuiz,
  CreateUser,
  GetDisciplineById,
  GetDisciplineByName,
  GetDisciplines,
  GetNextQuestion,
  GetQuestionById,
  GetQuizById,
  GetQuizzes,
  GetUserByEmail,
  GetUserById,
  GetUsers,
  LoginUser,
  LogoutUser,
} from "./application/usecase"
import { DisciplineController } from "./infra/http/controller/DisciplineController"
import {
  DisciplineRepositoryDatabase,
  LearningRepositoryDatabase,
  QuestionRepositoryDatabase,
  QuizRepositoryDatabase,
  UserRepositoryDatabase,
} from "./infra/repository"
import { getTestDatabaseAdapter, PgPromiseAdapter } from "./infra/database"
import { QuizController, UserController } from "./infra/http/controller"
import { AuthController } from "./infra/http/controller/AuthController"
import { setupSwagger } from "./swagger"

const app = express()

// Environment validation
if (process.env.NODE_ENV !== "test" && !process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is not set")
  console.error("Please set DATABASE_URL to a valid PostgreSQL connection string")
  console.error("Example: DATABASE_URL=postgres://username:password@host:port/database")
  process.exit(1)
}

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// Create router for /api
const apiRouter = express.Router()

// Repository instances
const connection = process.env.NODE_ENV !== "test" ? new PgPromiseAdapter() : getTestDatabaseAdapter()
const disciplineRepository = new DisciplineRepositoryDatabase(connection)
const userRepository = new UserRepositoryDatabase(connection)
const quizRepository = new QuizRepositoryDatabase(connection, userRepository, disciplineRepository)
const questionRepository = new QuestionRepositoryDatabase(connection)
const learningRepository = new LearningRepositoryDatabase(connection)

// Use case instances
const getDisciplines = new GetDisciplines(disciplineRepository)
const getDisciplineById = new GetDisciplineById(disciplineRepository)
const getDisciplineByName = new GetDisciplineByName(disciplineRepository)
const createUser = new CreateUser(userRepository)
const loginUser = new LoginUser(userRepository)
const logoutUser = new LogoutUser(userRepository)
const getUsers = new GetUsers(userRepository)
const getUserById = new GetUserById(userRepository)
const getUserByEmail = new GetUserByEmail(userRepository)
const getQuizById = new GetQuizById(quizRepository)
// const getQuestionById = new GetQuestionById(questionRepository)
const getNextQuestion = new GetNextQuestion(questionRepository, quizRepository, learningRepository)
const checkQuizAnswer = new CheckQuizAnswer(
  userRepository,
  disciplineRepository,
  questionRepository,
  quizRepository,
  learningRepository
)
const getQuizzes = new GetQuizzes(quizRepository)
const createQuiz = new CreateQuiz(quizRepository, userRepository, disciplineRepository)

// Controllers setup
new UserController(apiRouter, getUsers, getUserById, getUserByEmail)
new DisciplineController(apiRouter, getDisciplines, getDisciplineById, getDisciplineByName)
new QuizController(apiRouter, createQuiz, getQuizzes, getQuizById, getNextQuestion, checkQuizAnswer)
new AuthController(apiRouter, createUser, loginUser, logoutUser)

// Mount API routes
app.use("/api", apiRouter)

// Setup Swagger documentation
setupSwagger(app)

// Root redirect to API docs
app.get("/", (req, res) => {
  res.redirect("/api-docs")
})

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
  })
})

export default app
