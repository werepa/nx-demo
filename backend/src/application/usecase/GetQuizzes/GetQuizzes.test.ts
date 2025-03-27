import { Discipline } from "../../../domain/entity/Discipline"
import { Quiz } from "../../../domain/entity/Quiz"
import { disciplineMock, topicMock } from "../../../tests/mocks/disciplineMock"
import { userMock } from "../../../tests/mocks"
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
import { GetQuizzes } from "./GetQuizzes"

describe("GetQuizzes", () => {
  let connection: DatabaseConnection
  let disciplineRepository: DisciplineRepository
  let userRepository: UserRepository
  let questionRepository: QuestionRepository
  let quizRepository: QuizRepository
  let getQuizzes: GetQuizzes

  beforeAll(() => {
    connection = getTestDatabaseAdapter()

    userRepository = new UserRepositoryDatabase(connection)
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)
    quizRepository = new QuizRepositoryDatabase(connection, userRepository, disciplineRepository)

    getQuizzes = new GetQuizzes(quizRepository)
  })

  beforeEach(async () => {
    await connection.clear(["quiz_answers", "quizzes", "questions", "topics", "disciplines", "users"])
  })

  afterAll(() => {
    connection.close()
  })

  test("should return the quizzes when exists", async () => {
    const user1 = userMock()
    await userRepository.save(user1)

    const user2 = userMock()
    await userRepository.save(user2)

    const discipline1: Discipline = disciplineMock()
    const topic1 = topicMock({ name: "topic1" })
    discipline1.topics.add(topic1)
    await disciplineRepository.save(discipline1)

    const discipline2: Discipline = disciplineMock()
    const topic2 = topicMock({ name: "topic2" })
    const topic3 = topicMock({ name: "topic3" })
    const topic4 = topicMock({ name: "topic4" })
    discipline2.topics.add(topic2)
    discipline2.topics.add(topic3)
    discipline2.topics.add(topic4)
    discipline2.setTopicParent({ topic: topic4, topicParent: topic3 })
    await disciplineRepository.save(discipline2)

    const quiz1: Quiz = Quiz.create({ user: user1, discipline: discipline1 })
    quiz1.topicsRoot.add(topic1)
    await quizRepository.save(quiz1)

    const quiz2: Quiz = Quiz.create({ user: user1, discipline: discipline2 })
    quiz2.topicsRoot.add(topic2)
    quiz2.topicsRoot.add(topic3)
    await quizRepository.save(quiz2)

    const quiz3: Quiz = Quiz.create({ user: user2, discipline: discipline1 })
    quiz3.topicsRoot.add(topic1)
    await quizRepository.save(quiz3)

    expect(quiz1.topicsRoot.listId()).toEqual([topic1.topicId])
    expect(quiz2.topicsRoot.listId().sort()).toEqual([topic2.topicId, topic3.topicId].sort())

    let quizzesSaved = await getQuizzes.execute({ userId: user1.userId })
    expect(quizzesSaved.length).toBe(2)
    expect(
      quizzesSaved
        .sort((a, b) => {
          if (a.quizId < b.quizId) return -1
          if (a.quizId > b.quizId) return 1
          return 0
        })
        .map((quiz) => quiz.toDTO())
    ).toEqual(
      [quiz1.toDTO(), quiz2.toDTO()].sort((a, b) => {
        if (a.quizId < b.quizId) return -1
        if (a.quizId > b.quizId) return 1
        return 0
      })
    )

    quizzesSaved = await getQuizzes.execute({
      userId: user1.userId,
      disciplineId: discipline2.disciplineId,
    })
    expect(quizzesSaved.length).toBe(1)
    expect(quizzesSaved[0].quizId).toBe(quiz2.quizId)
  })

  test("should return empty when the quiz does not exist!", async () => {
    const nonExistentUserId = faker.string.uuid()
    expect(await getQuizzes.execute({ userId: nonExistentUserId })).toEqual([])
  })
})
