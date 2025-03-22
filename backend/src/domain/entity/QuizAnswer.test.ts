import { CreateQuizAnswerCommand, QuizAnswer } from "./QuizAnswer"
import { DateBr } from "../../shared/domain/valueObject/DateBr"
import { faker } from "@faker-js/faker"
import { QuizAnswerState } from "../../shared/models"

describe("QuizAnswer", () => {
  describe("create", () => {
    it("should create a new QuizAnswer instance", () => {
      const correctOptionId = faker.string.uuid()
      const dto: CreateQuizAnswerCommand = {
        quizId: "quizId",
        questionId: "questionId",
        topicId: "topicId",
        correctOptionId,
        userOptionId: correctOptionId,
        isUserAnswerCorrect: true,
      }
      const quizAnswer = QuizAnswer.create(dto)
      expect(quizAnswer).toBeInstanceOf(QuizAnswer)
      expect(quizAnswer.quizId).toBe(dto.quizId)
      expect(quizAnswer.questionId).toBe(dto.questionId)
      expect(quizAnswer.userOptionId).toBe(dto.userOptionId)
      expect(quizAnswer.isUserAnswerCorrect).toBe(dto.isUserAnswerCorrect)
      expect(quizAnswer.createdAt).toBeInstanceOf(DateBr)
    })
  })

  describe("toDomain", () => {
    it("should create a QuizAnswer instance", () => {
      const correctOptionId = faker.string.uuid()
      const state: QuizAnswerState = {
        quizAnswerId: "quizAnswerId",
        quizId: "quizId",
        questionId: "questionId",
        topicId: "topicId",
        correctOptionId,
        userOptionId: correctOptionId,
        isUserAnswerCorrect: true,
        canRepeat: false,
        createdAt: faker.date.recent(),
      }
      const quizAnswer = QuizAnswer.toDomain(state)
      expect(quizAnswer).toBeInstanceOf(QuizAnswer)
      expect(quizAnswer.quizAnswerId).toBe(state.quizAnswerId)
      expect(quizAnswer.quizId).toBe(state.quizId)
      expect(quizAnswer.questionId).toBe(state.questionId)
      expect(quizAnswer.userOptionId).toBe(state.userOptionId)
      expect(quizAnswer.isUserAnswerCorrect).toBe(state.isUserAnswerCorrect)
      expect(quizAnswer.createdAt).toBeInstanceOf(DateBr)
    })

    it("should throw an error if required properties are missing", () => {
      // @ts-expect-error Testing missing createdAt
      const state: QuizAnswerState = {
        quizAnswerId: "quizAnswerId",
        quizId: "quizId",
        questionId: "questionId",
        topicId: "topicId",
        userOptionId: "optionId",
        isUserAnswerCorrect: true,
        canRepeat: false,
      }
      expect(() => QuizAnswer.toDomain(state)).toThrow("Missing required properties")
    })
  })
})
