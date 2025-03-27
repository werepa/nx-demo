import { DisciplineRepository } from "../../application/repository/DisciplineRepository"
import { QuestionRepository } from "../../application/repository/QuestionRepository"
import { QuizRepository } from "../../application/repository/QuizRepository"
import { UserRepository } from "../../application/repository/UserRepository"
import { DatabaseConnection } from "../database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../database/TestDatabaseAdapter"
import { disciplineMock, topicMock } from "../../tests/mocks/disciplineMock"
import { quizMock } from "../../tests/mocks/quizMock"
import { DisciplineRepositoryDatabase } from "./DisciplineRepositoryDatabase"
import { UserRepositoryDatabase } from "./UserRepositoryDatabase"
import { QuestionRepositoryDatabase } from "./QuestionRepositoryDatabase"
import { QuizRepositoryDatabase } from "./QuizRepositoryDatabase"
import { userMock } from "../../tests/mocks"

describe("QuizRepositoryDatabase", () => {
  let connection: DatabaseConnection
  let disciplineRepository: DisciplineRepository
  let userRepository: UserRepository
  let questionRepository: QuestionRepository
  let quizRepository: QuizRepository

  beforeAll(() => {
    connection = getTestDatabaseAdapter()

    userRepository = new UserRepositoryDatabase(connection)
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)
    quizRepository = new QuizRepositoryDatabase(connection, userRepository, disciplineRepository)
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

  test("should save a quiz", async () => {
    const user = userMock()
    await userRepository.save(user)
    await userRepository.getById(user.userId)

    const discipline = disciplineMock()
    const topic1 = topicMock({ name: "topic 1" })
    const topic2 = topicMock({ name: "topic 2" })
    const topic3 = topicMock({ name: "topic 3" })
    discipline.topics.add(topic1)
    discipline.topics.add(topic2)
    discipline.topics.add(topic3)
    discipline.setTopicParent({ topic: topic2, topicParent: topic1 })
    discipline.topic({ topicId: topic3.topicId })?.deactivate()
    await disciplineRepository.save(discipline)
    const disciplineSaved = await disciplineRepository.getById(discipline.disciplineId)

    const quiz = quizMock({ user: user, discipline: disciplineSaved })
    await quizRepository.save(quiz)
    const savedQuiz = await quizRepository.getById(quiz.quizId)
    expect(savedQuiz.toDTO()).toEqual(quiz.toDTO())
  })

  test("should get all quizzes for a user", async () => {
    const user1 = userMock()
    const user2 = userMock()
    await userRepository.save(user1)
    await userRepository.save(user2)

    const discipline1 = disciplineMock()
    const topic1 = topicMock({ name: "topic 1" })
    const topic2 = topicMock({ name: "topic 2" })
    discipline1.topics.add(topic1)
    discipline1.topics.add(topic2)
    await disciplineRepository.save(discipline1)

    const discipline2 = disciplineMock()
    const topic3 = topicMock({ name: "topic 3" })
    discipline2.topics.add(topic3)
    await disciplineRepository.save(discipline2)

    const quiz1 = quizMock({ user: user1, discipline: discipline1 })
    const quiz2 = quizMock({ user: user1, discipline: discipline2 })
    const quiz3 = quizMock({ user: user2, discipline: discipline1 })
    await quizRepository.save(quiz1)
    await quizRepository.save(quiz2)
    await quizRepository.save(quiz3)

    const quizzes = await quizRepository.getAll({ userId: user1.userId })
    expect(quizzes).toHaveLength(2)

    const result1 = quizzes.filter((q) => q.quizId === quiz1.quizId)[0]
    expect(result1.quizId).toBe(quiz1.quizId)
    expect(result1.quizType).toEqual(quiz1.quizType)
    expect(result1.discipline.id).toEqual(quiz1.discipline.id)
    expect(result1.discipline.topics.getCount()).toEqual(quiz1.discipline.topics.getCount())
    expect(result1.user.id).toEqual(quiz1.user.id)
    expect(result1.topicsRoot.getCount()).toEqual(quiz1.topicsRoot.getCount())
    expect(result1.answers.getCount()).toEqual(quiz1.answers.getCount())
    expect(result1.isActive).toEqual(quiz1.isActive)

    const result2 = quizzes.filter((q) => q.quizId === quiz2.quizId)[0]
    expect(result2.quizId).toBe(quiz2.quizId)
    expect(result2.quizType).toEqual(quiz2.quizType)
    expect(result2.discipline.id).toEqual(quiz2.discipline.id)
    expect(result2.discipline.topics.getCount()).toEqual(quiz2.discipline.topics.getCount())
    expect(result2.user.id).toEqual(quiz2.user.id)
    expect(result2.topicsRoot.getCount()).toEqual(quiz2.topicsRoot.getCount())
    expect(result2.answers.getCount()).toEqual(quiz2.answers.getCount())
    expect(result2.isActive).toEqual(quiz2.isActive)
  })
})
