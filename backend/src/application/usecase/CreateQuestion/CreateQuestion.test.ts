import { CreateQuestion, CreateQuestionDTO } from "./CreateQuestion"
import { DisciplineRepository } from "../../repository/DisciplineRepository"
import { QuestionRepository } from "../../repository/QuestionRepository"
import { DatabaseConnection } from "../../../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../../../infra/database/TestDatabaseAdapter"
import { DisciplineRepositoryDatabase } from "../../../infra/repository/DisciplineRepositoryDatabase"
import { QuestionRepositoryDatabase } from "../../../infra/repository/QuestionRepositoryDatabase"
import { disciplineMock, topicMock } from "../../../tests/mocks/disciplineMock"

describe("CreateQuestion", () => {
  let connection: DatabaseConnection
  let questionRepository: QuestionRepository
  let disciplineRepository: DisciplineRepository
  let createQuestion: CreateQuestion

  beforeEach(async () => {
    connection = getTestDatabaseAdapter()

    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)

    await questionRepository.clear()
    await disciplineRepository.clear()

    createQuestion = new CreateQuestion(questionRepository)
  })

  afterEach(() => {
    connection.close()
  })

  it("should create a question", async () => {
    const portugues = disciplineMock({ name: "Português" })
    const crase = topicMock({ name: "Crase" })
    portugues.topics.add(crase)
    await disciplineRepository.save(portugues)

    const dto: CreateQuestionDTO = {
      prompt: "What is the capital of France?",
      options: [
        { text: "Paris", isCorrectAnswer: true },
        { text: "London", isCorrectAnswer: false },
        { text: "Berlin", isCorrectAnswer: false },
        { text: "Madrid", isCorrectAnswer: false },
      ],
      topicId: crase.topicId,
      topicRootId: crase.topicRootId,
    }
    const questionSaved = await createQuestion.execute(dto)

    expect(questionSaved.questionId).toBeDefined()
    expect(questionSaved.prompt).toBe(dto.prompt)
    expect(questionSaved.options.getCount()).toEqual(dto.options.length)
    expect(questionSaved.options.getItems()[0].text).toBe(dto.options[0].text)
    expect(questionSaved.options.getItems()[0].isCorrectAnswer).toBe(dto.options[0].isCorrectAnswer)
    expect(questionSaved.topicId).toBe(dto.topicId)
    expect(questionSaved.topicRootId).toBe(dto.topicRootId)
    expect(questionSaved.createdAt).toBeDefined()
    expect(questionSaved.isActive).toBeTruthy()
  })
})
