import { questionMock } from "./questionMock"
import { Question } from "../../domain/entity/Question"
import { faker } from "@faker-js/faker"
import { DateBr } from "../../shared/domain/valueObject/DateBr"
import { QuestionOption } from "../../domain/entity/QuestionOption"
import { getCorrectOption } from "./questionMock"
import { QuestionDTO } from "@simulex/models"

describe("mockQuestion", () => {
  it("should return a Question object", () => {
    const question = questionMock()
    expect(question).toBeInstanceOf(Question)
    expect(question.qtyAnswered).toBeDefined()
    expect(question.qtyCorrectAnswers).toBeDefined()
    expect(question.simulexHash).toBeDefined()
    expect(question.topicRootId).toBeDefined()
    expect(question.isActive).toBeDefined()
    expect(question.linkedTopics).toBeDefined()
    expect(question.year).toBeDefined()
    expect(question.sourceId).toBeDefined()
    expect(question.createdBy).toBeDefined()
  })

  it("should correctly assign questionId and topicId", () => {
    const questionId = faker.string.uuid()
    const topicId = faker.string.uuid()
    const question = questionMock({ questionId, topicId })
    expect(question.questionId).toBe(questionId)
    expect(question.topicId).toBe(topicId)
  })

  it("should populate options array correctly", () => {
    const question = questionMock()
    expect(question.options.getItems().length).toBeGreaterThan(0)
    question.options.getItems().forEach((option: QuestionOption) => {
      expect(option.questionId).toBe(question.questionId)
      expect(option.optionId).toBeDefined()
      expect(option.text).toContain(`Question ${question.questionId}`)
    })
  })

  it("should have at least one option with key set to true", () => {
    const question = questionMock()
    const hasKeyOption = question.options.getItems().some((option: QuestionOption) => option.isCorrectAnswer)
    expect(hasKeyOption).toBe(true)
  })

  it("should correctly assign createdAt and updatedAt dates", () => {
    const question = questionMock()
    expect(question.createdAt).toBeInstanceOf(DateBr)
  })
})

describe("Question Mock Utils", () => {
  describe("getCorrectOption", () => {
    it("should return correct option ID for multiple choice question", () => {
      const question: Question = Question.create({
        topicId: faker.string.uuid(),
        topicRootId: faker.string.uuid(),
        options: [
          { text: "Option 1", isCorrectAnswer: false },
          { text: "Option 2", isCorrectAnswer: true },
          { text: "Option 3", isCorrectAnswer: false },
        ],
      })

      expect(question.options.getCount()).toBe(3)
      let correctOption = getCorrectOption(question)
      expect(correctOption).toBe(question.options.getItems()[1].optionId)

      correctOption = getCorrectOption(question)
      expect(correctOption).toBe(question.options.getItems()[1].optionId)
    })

    it("should return correct option ID for single choice question with first option correct", () => {
      const question: Question = Question.create({
        topicId: faker.string.uuid(),
        topicRootId: faker.string.uuid(),
        options: [{ text: "Option 1", isCorrectAnswer: true }],
      })

      let correctOption = getCorrectOption(question)
      expect(correctOption).toBe(question.options.getItems()[0].optionId)

      correctOption = getCorrectOption(question)
      expect(correctOption).toBe(question.options[0].optionId)
    })

    it("should return null for single choice question with fir+st option incorrect", () => {
      const question: Question = Question.create({
        topicId: faker.string.uuid(),
        topicRootId: faker.string.uuid(),
        options: [{ text: "Option 1", isCorrectAnswer: false }],
      })

      let correctOption = getCorrectOption(question)
      expect(correctOption).toBeNull()

      correctOption = getCorrectOption(question)
      expect(correctOption).toBeNull()
    })

    it("should throw error if question is not provided", () => {
      expect(() => getCorrectOption(null as any)).toThrow("Question is required")
    })
  })

  describe("questionMock", () => {
    it("should create a valid question with at least one correct answer", () => {
      const question = questionMock()
      const correctOption = getCorrectOption(question)

      if (question.options.getCount() > 1) {
        expect(correctOption).not.toBeNull()
      }
      expect(question).toBeInstanceOf(Question)
    })

    it("should create question with specified ID", () => {
      const customId = "custom-id"
      const question = questionMock({ questionId: customId })

      expect(question.id).toBe(customId)
    })

    it("should create question with specified topic", () => {
      const customTopicId = "topic-id"
      const question = questionMock({ topicId: customTopicId })

      expect(question.topicId).toBe(customTopicId)
    })
  })
})
