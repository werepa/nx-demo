import { Discipline } from "../../../domain/entity/Discipline"
import { Quiz } from "../../../domain/entity/Quiz"
import { disciplineMock, topicMock } from "../../../tests/mocks/disciplineMock"
import { userMock } from "../../../tests/mocks"
import { GetQuizById } from ".."
import { DatabaseConnection } from "../../../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../../../infra/database/TestDatabaseAdapter"
import { DisciplineRepository } from "../../repository/DisciplineRepository"
import { QuestionRepository } from "../../repository/QuestionRepository"
import { QuizRepository } from "../../repository/QuizRepository"
import { UserRepository } from "../../repository/UserRepository"
import { DisciplineRepositoryDatabase } from "../../../infra/repository/DisciplineRepositoryDatabase"
import { QuestionRepositoryDatabase } from "../../../infra/repository/QuestionRepositoryDatabase"
import { QuizRepositoryDatabase } from "../../../infra/repository/QuizRepositoryDatabase"
import { UserRepositoryDatabase } from "../../../infra/repository/UserRepositoryDatabase"
import { faker } from "@faker-js/faker"

describe("GetQuizById", () => {
  let connection: DatabaseConnection
  let disciplineRepository: DisciplineRepository
  let userRepository: UserRepository
  let questionRepository: QuestionRepository
  let quizRepository: QuizRepository
  let getQuizById: GetQuizById

  beforeAll(() => {
    connection = getTestDatabaseAdapter()

    userRepository = new UserRepositoryDatabase(connection)
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)
    quizRepository = new QuizRepositoryDatabase(
      connection,
      userRepository,
      disciplineRepository,
    )

    getQuizById = new GetQuizById(quizRepository)
  })

  beforeEach(async () => {
    await quizRepository.clear()
    await questionRepository.clear()
    await disciplineRepository.clear()
    await userRepository.clear()
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
})
