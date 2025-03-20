import { CreateQuizAnswerInput, QuizAnswer } from "./QuizAnswer"
import { DateBr } from "../../shared/domain/valueObject/DateBr"
import { faker } from "@faker-js/faker"
import { QuizAnswerState } from "../../shared/models"

describe("QuizAnswer", () => {
  describe("create", () => {
    it("should create a new QuizAnswer instance", () => {
      const dto: CreateQuizAnswerInput = {
        quizId: "quizId",
        questionId: "questionId",
        topicId: "topicId",
        optionId: "optionId",
        correctAnswered: true,
      }
      const quizAnswer = QuizAnswer.create(dto)
      expect(quizAnswer).toBeInstanceOf(QuizAnswer)
      expect(quizAnswer.quizId).toBe(dto.quizId)
      expect(quizAnswer.questionId).toBe(dto.questionId)
      expect(quizAnswer.optionId).toBe(dto.optionId)
      expect(quizAnswer.correctAnswered).toBe(dto.correctAnswered)
      expect(quizAnswer.createdAt).toBeInstanceOf(DateBr)
    })
  })

  describe("toDomain", () => {
    it("should create a QuizAnswer instance", () => {
      const state: QuizAnswerState = {
        quizAnswerId: "quizAnswerId",
        quizId: "quizId",
        questionId: "questionId",
        topicId: "topicId",
        optionId: "optionId",
        correctAnswered: true,
        canRepeat: false,
        createdAt: faker.date.recent(),
      }
      const quizAnswer = QuizAnswer.toDomain(state)
      expect(quizAnswer).toBeInstanceOf(QuizAnswer)
      expect(quizAnswer.quizAnswerId).toBe(state.quizAnswerId)
      expect(quizAnswer.quizId).toBe(state.quizId)
      expect(quizAnswer.questionId).toBe(state.questionId)
      expect(quizAnswer.optionId).toBe(state.optionId)
      expect(quizAnswer.correctAnswered).toBe(state.correctAnswered)
      expect(quizAnswer.createdAt).toBeInstanceOf(DateBr)
    })

    it("should throw an error if required properties are missing", () => {
      // @ts-expect-error Testing missing createdAt
      const state: QuizAnswerState = {
        quizAnswerId: "quizAnswerId",
        quizId: "quizId",
        questionId: "questionId",
        topicId: "topicId",
        optionId: "optionId",
        correctAnswered: true,
        canRepeat: false,
      }
      expect(() => QuizAnswer.toDomain(state)).toThrow("Missing required properties")
    })
  })
})
