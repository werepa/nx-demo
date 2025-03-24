import { DateBr } from "../../shared/domain/valueObject/DateBr"
import { faker } from "@faker-js/faker"
import { QuestionOption } from "./QuestionOption"
import { CreateQuestionCommand, Question } from "./Question"
import { questionMock } from "../../tests/mocks/questionMock"
import { QuestionOptionList } from "./QuestionOptionList"

describe("Entity => Question", () => {
  let question: Question

  it("should create a question with the correct parameters", () => {
    const dto: CreateQuestionCommand = {
      topicId: faker.string.uuid(),
      topicRootId: faker.string.uuid(),
      prompt: "Qual é a capital da França?",
      options: [
        { text: "Paris", key: true },
        { text: "Londres", key: false },
        { text: "Berlim", key: false },
        { text: "Madrid", key: false },
      ],
      year: "2023",
      sourceId: "fonte-123",
      createdBy: faker.string.uuid(),
    }
    question = Question.create(dto)
    expect(question).toBeInstanceOf(Question)
    expect(question.questionId).toHaveLength(36)
    expect(question.topicId).toBe(dto.topicId)
    expect(question.topicRootId).toBe(dto.topicRootId)
    expect(question.prompt).toBe(dto.prompt)
    expect(question.isMultipleChoice).toBe(true)
    expect(question.difficulty).toBe(0.5)
    expect(question.qtyCorrectAnswers).toBe(0)
    expect(question.qtyAnswered).toBe(0)
    expect(question.difficultyRecursive).toBe(0.5)
    expect(question.simulexHash).toHaveLength(32)
    expect(question.linkedTopics).toEqual([])
    expect(question.year).toBe(dto.year)
    expect(question.sourceId).toBe(dto.sourceId)
    expect(question.isActive).toBe(true)
    expect(question.createdBy).toBe(dto.createdBy)
    expect(question.createdAt).toBeInstanceOf(DateBr)
    expect(question.options).toBeInstanceOf(QuestionOptionList)
    expect(question.options.getItems()).toHaveLength(4)
    expect(question.options.getItems()[0]).toBeInstanceOf(QuestionOption)

    const dtoSimplificado: CreateQuestionCommand = {
      topicId: faker.string.uuid(),
      topicRootId: faker.string.uuid(),
      options: [
        {
          text: "42 é a resposta para a vida, o universo e tudo mais",
          key: true,
        },
      ],
    }
    question = Question.create(dtoSimplificado)
    expect(question).toBeInstanceOf(Question)
    expect(question.prompt).toBe("Julgue o item abaixo:")
    expect(question.isMultipleChoice).toBe(false)
    expect(question.options.getItems()).toHaveLength(1)

    const dtoWithoutMultipleChoiceProperty: CreateQuestionCommand = {
      topicId: faker.string.uuid(),
      topicRootId: faker.string.uuid(),
      options: [
        { text: "alternativa 1", key: true },
        { text: "alternativa 1", key: false },
      ],
    }
    question = Question.create(dtoWithoutMultipleChoiceProperty)
    expect(question).toBeInstanceOf(Question)
    expect(question.isMultipleChoice).toBe(true)
    expect(question.options.getItems()).toHaveLength(2)
  })

  it("should throw an error if not key or several keys to multiple choice questions", () => {
    const dto1: CreateQuestionCommand = {
      topicId: faker.string.uuid(),
      topicRootId: faker.string.uuid(),
      options: [
        { text: "alternativa 1", key: false },
        { text: "alternativa 2", key: false },
      ],
    }
    expect(() => Question.create(dto1)).toThrow("Questions of type multiple choice must be at least one correct key")

    const dto2: CreateQuestionCommand = {
      topicId: faker.string.uuid(),
      topicRootId: faker.string.uuid(),
      options: [
        { text: "alternativa 1", key: true },
        { text: "alternativa 2", key: true },
      ],
    }
    expect(() => Question.create(dto2)).toThrow("Questions of type multiple choice must be only one correct key")
  })

  it("should link a question to a subject", async () => {
    const topicId = faker.string.uuid()
    question = Question.create({
      topicId: topicId,
      topicRootId: faker.string.uuid(),
      prompt: "Qual é a capital da França?",
      options: [
        { text: "Paris", key: true },
        { text: "Londres", key: false },
        { text: "Berlim", key: false },
        { text: "Madrid", key: false },
      ],
      year: "2023",
      sourceId: "fonte-123",
      createdBy: faker.string.uuid(),
    })
    const anotherTopicId = faker.string.uuid()
    question.linkTopic(anotherTopicId)
    expect(question.linkedTopics).toContain(anotherTopicId)
  })

  it("should unlink a question to a subject", async () => {
    const topicId1 = faker.string.uuid()
    const topicId2 = faker.string.uuid()
    const topicId3 = faker.string.uuid()
    question = questionMock()
    question.linkTopic(topicId1)
    question.linkTopic(topicId2)
    question.linkTopic(topicId3)
    expect(question.linkedTopics).toHaveLength(3)
    question.unlinkTopic(topicId2)
    expect(question.linkedTopics).toHaveLength(2)
  })

  it("should convert Question to DTO", () => {
    const dto: CreateQuestionCommand = {
      topicId: faker.string.uuid(),
      topicRootId: faker.string.uuid(),
      prompt: "Qual é a capital da França?",
      options: [
        { text: "Paris", key: true },
        { text: "Londres", key: false },
        { text: "Berlim", key: false },
        { text: "Madrid", key: false },
      ],
      year: "2023",
      sourceId: "fonte-123",
      createdBy: faker.string.uuid(),
    }
    question = Question.create(dto)
    const questionDTO = question.toDTO()

    expect(questionDTO.questionId).toBe(question.questionId)
    expect(questionDTO.topicId).toBe(question.topicId)
    expect(questionDTO.prompt).toBe(question.prompt)
    expect(questionDTO.isMultipleChoice).toBe(question.isMultipleChoice)
    expect(questionDTO.difficulty).toBe(question.difficulty)
    expect(questionDTO.qtyAnswered).toBe(question.qtyAnswered)
    expect(questionDTO.qtyCorrectAnswers).toBe(question.qtyCorrectAnswers)
    expect(questionDTO.difficultyRecursive).toBe(question.difficultyRecursive)
    expect(questionDTO.simulexHash).toBe(question.simulexHash)
    expect(questionDTO.topicRootId).toBe(question.topicRootId)
    expect(questionDTO.linkedTopics).toEqual(question.linkedTopics)
    expect(questionDTO.year).toBe(question.year)
    expect(questionDTO.sourceId).toBe(question.sourceId)
    expect(questionDTO.isActive).toBe(question.isActive)
    expect(questionDTO.createdBy).toBe(question.createdBy)
    // Fix date comparison by comparing the ISO string representations
    expect(questionDTO.createdAt).toBe(question.createdAt.value)
    const options = questionDTO.options
    expect(options).toHaveLength(4)
    options.forEach((alt, index) => {
      expect(alt.text).toBe(options[index].text)
      expect(alt.isCorrectAnswer).toBe(options[index].isCorrectAnswer)
    })
  })
})
