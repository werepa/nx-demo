import { CreateQuizAnswerInput, QuizAnswer } from "./QuizAnswer"
import { DateBr } from "../../shared/domain/valueObject/DateBr"
import { faker } from "@faker-js/faker"
import { QuizAnswerFromPersistence } from "../../shared/models"

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
      const fromPersistence: QuizAnswerFromPersistence = {
        quizAnswerId: "quizAnswerId",
        quizId: "quizId",
        questionId: "questionId",
        topicId: "topicId",
        optionId: "optionId",
        correctAnswered: true,
        canRepeat: false,
        createdAt: faker.date.recent(),
      }
      const quizAnswer = QuizAnswer.toDomain(fromPersistence)
      expect(quizAnswer).toBeInstanceOf(QuizAnswer)
      expect(quizAnswer.quizAnswerId).toBe(fromPersistence.quizAnswerId)
      expect(quizAnswer.quizId).toBe(fromPersistence.quizId)
      expect(quizAnswer.questionId).toBe(fromPersistence.questionId)
      expect(quizAnswer.optionId).toBe(fromPersistence.optionId)
      expect(quizAnswer.correctAnswered).toBe(fromPersistence.correctAnswered)
      expect(quizAnswer.createdAt).toBeInstanceOf(DateBr)
    })

    it("should throw an error if required properties are missing", () => {
      // @ts-expect-error Testing missing createdAt
      const fromPersistence: QuizAnswerFromPersistence = {
        quizAnswerId: "quizAnswerId",
        quizId: "quizId",
        questionId: "questionId",
        topicId: "topicId",
        optionId: "optionId",
        correctAnswered: true,
        canRepeat: false,
      }
      expect(() => QuizAnswer.toDomain(fromPersistence)).toThrow(
        "Missing required properties",
      )
    })
  })
})
