import { faker } from "@faker-js/faker"
import { DatabaseConnection, getTestDatabaseAdapter } from "../../../infra/database"
import { DisciplineRepositoryDatabase, QuestionRepositoryDatabase } from "../../../infra/repository"
import { disciplineMock, questionMock, topicMock } from "../../../tests/mocks"
import { GetQuestionById } from "./GetQuestionById"

describe("UseCase => GetQuestionById", () => {
  let connection: DatabaseConnection
  let getQuestionById: GetQuestionById
  let disciplineRepository: DisciplineRepositoryDatabase
  let questionRepository: QuestionRepositoryDatabase

  beforeEach(async () => {
    connection = getTestDatabaseAdapter()

    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)

    await connection.clear(["questions", "topics", "disciplines"])

    getQuestionById = new GetQuestionById(questionRepository)
  })

  afterAll(() => {
    connection.close()
  })

  test("should return a question by ID", async () => {
    const portugues = disciplineMock({ name: "Português" })
    const crase = topicMock({ name: "Crase" })
    portugues.topics.add(crase)
    await disciplineRepository.save(portugues)

    const question = questionMock({ topicId: crase.topicId })
    await questionRepository.save(question)

    const result = await getQuestionById.execute(question.questionId)
    expect(result).toEqual(question)
  })

  test("should throw error when question not found", async () => {
    const nonExistentQuestionId = faker.string.uuid()
    await expect(getQuestionById.execute(nonExistentQuestionId)).rejects.toThrow(
      `Question ID:${nonExistentQuestionId} does not exist!`
    )
  })
})
