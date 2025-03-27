import { Discipline } from "../../../domain/entity/Discipline"
import { Quiz } from "../../../domain/entity/Quiz"
import { disciplineMock, topicMock } from "../../../tests/mocks/disciplineMock"
import { userMock } from "../../../tests/mocks"
import { GetQuizById } from ".."
import { DatabaseConnection, getTestDatabaseAdapter } from "../../../infra/database"
import { DisciplineRepositoryDatabase, QuizRepositoryDatabase, UserRepositoryDatabase } from "../../../infra/repository"
import { faker } from "@faker-js/faker"

describe("UseCase => GetQuizById", () => {
  let connection: DatabaseConnection
  let getQuizById: GetQuizById
  let userRepository: UserRepositoryDatabase
  let disciplineRepository: DisciplineRepositoryDatabase
  let quizRepository: QuizRepositoryDatabase

  beforeEach(async () => {
    connection = getTestDatabaseAdapter()

    userRepository = new UserRepositoryDatabase(connection)
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    quizRepository = new QuizRepositoryDatabase(connection, userRepository, disciplineRepository)

    await connection.clear(["quiz_answers", "quizzes", "questions", "topics", "disciplines", "users"])

    getQuizById = new GetQuizById(quizRepository)
  })

  afterAll(() => {
    connection.close()
  })

  test("should return the quiz when it exists", async () => {
    const user = userMock()
    await userRepository.save(user)

    let discipline: Discipline = disciplineMock()
    const topic1 = topicMock({ name: "topic1" })
    discipline.topics.add(topic1)
    await disciplineRepository.save(discipline)
    discipline = await disciplineRepository.getById(discipline.disciplineId)

    const quiz: Quiz = Quiz.create({ user, discipline })
    quiz.topicsRoot.add(topic1)
    await quizRepository.save(quiz)
    const quizSaved = await getQuizById.execute(quiz.quizId)
    expect(quizSaved?.toDTO()).toEqual(quiz.toDTO())
    expect(quiz.topicsRoot.listId()).toEqual([topic1.topicId])
  })

  test("should return null when the quiz does not exist!", async () => {
    const nonExistentQuizId = faker.string.uuid()
    expect(await getQuizById.execute(nonExistentQuizId)).toBeNull()
  })

  test("should throw an error if quiz does not exist", async () => {
    const nonExistentQuizId = "non-existent-quiz-id"
    await expect(getQuizById.execute(nonExistentQuizId)).rejects.toThrow(`Quiz ID:${nonExistentQuizId} does not exist!`)
  })
})
