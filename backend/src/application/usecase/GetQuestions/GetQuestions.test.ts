import { DatabaseConnection } from "../../../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../../../infra/database/TestDatabaseAdapter"
import { GetQuestions } from "./GetQuestions"
import { disciplineMock, topicMock } from "../../../tests/mocks/disciplineMock"
import { questionMock } from "../../../tests/mocks/questionMock"
import { DisciplineRepository } from "../../repository/DisciplineRepository"
import { QuestionRepository } from "../../repository/QuestionRepository"
import { DisciplineRepositoryDatabase } from "../../../infra/repository/DisciplineRepositoryDatabase"
import { QuestionRepositoryDatabase } from "../../../infra/repository/QuestionRepositoryDatabase"

describe("GetQuestions", () => {
  let connection: DatabaseConnection
  let disciplineRepository: DisciplineRepository
  let questionRepository: QuestionRepository
  let getQuestions: GetQuestions

  beforeAll(async () => {
    connection = getTestDatabaseAdapter()
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)
    getQuestions = new GetQuestions(questionRepository)
  })

  beforeEach(async () => {
    await questionRepository.clear()
    await disciplineRepository.clear()
  })

  afterAll(() => {
    connection.close()
  })

  test.only("should return questions when topicId and showAll are provided", async () => {
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

    const sortedQuestions = questions.sort((a, b) => a.questionId.localeCompare(b.questionId))
    const sortedResult = result1.sort((a, b) => a.questionId.localeCompare(b.questionId))

    expect(sortedQuestions).toHaveLength(3)
    expect(sortedResult).toHaveLength(3)
    // expect(sortedResult[0].toDTO()).toEqual({ ...sortedQuestions[0].toDTO(), createdAt: sortedResult[0].toDTO().createdAt })
    // expect(sortedResult).toContainEqual(sortedQuestions[0])
    // expect(sortedResult).toContainEqual(sortedQuestions[2])

    // const result2 = await getQuestions.execute({ topicId: crase.topicId })
    // const sortedResult2 = result2.sort((a, b) => a.questionId.localeCompare(b.questionId))

    // expect(sortedResult2).toHaveLength(1)
    // expect(sortedResult2[0].toDTO()).toEqual(sortedQuestions[2].toDTO())
  })

  test("should throw error when no topicId are provided", async () => {
    // @ts-expect-error Testing if it throws an error when no topicId is provided
    await expect(getQuestions.execute({})).rejects.toThrow("Topic ID is required")
  })
})
