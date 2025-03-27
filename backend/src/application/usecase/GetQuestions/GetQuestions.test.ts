import { DatabaseConnection, getTestDatabaseAdapter } from "../../../infra/database"
import { DisciplineRepositoryDatabase, QuestionRepositoryDatabase } from "../../../infra/repository"
import { disciplineMock, questionMock, topicMock } from "../../../tests/mocks"
import { GetQuestions } from "./GetQuestions"

describe("UseCase => GetQuestions", () => {
  let connection: DatabaseConnection
  let getQuestions: GetQuestions
  let disciplineRepository: DisciplineRepositoryDatabase
  let questionRepository: QuestionRepositoryDatabase

  beforeEach(async () => {
    connection = getTestDatabaseAdapter()

    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)

    await connection.clear(["questions", "topics", "disciplines"])

    getQuestions = new GetQuestions(questionRepository)
  })

  afterAll(() => {
    connection.close()
  })

  test("should return questions when topicId and showAll are provided", async () => {
    const portugues = disciplineMock({ name: "Português" })
    const crase = topicMock({ name: "Crase" })
    const pronomes = topicMock({ name: "Pronomes" })
    portugues.topics.add(crase)
    portugues.topics.add(pronomes)
    await disciplineRepository.save(portugues)
    const questions = [
      questionMock({ topicId: crase.topicId }),
      questionMock({ topicId: pronomes.topicId }),
      questionMock({ topicId: crase.topicId }),
    ]
    questions[0].deactivate()

    await Promise.all(questions.map((question) => questionRepository.save(question)))

    const result1 = await getQuestions.execute({
      topicId: crase.topicId,
      showAll: true,
    })

    expect(questions).toHaveLength(3)
    expect(result1).toHaveLength(2)
    const result2 = await getQuestions.execute({
      topicId: crase.topicId,
      showAll: false,
    })
    expect(result2).toHaveLength(1)
  })
})
