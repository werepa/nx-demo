import { QuestionRepository } from "../../repository/QuestionRepository"
import { QuizRepository } from "../../repository/QuizRepository"
import { Question } from "../../../domain/entity/Question"
import { Quiz } from "../../../domain/entity/Quiz"
import { QuizAnswer } from "../../../domain/entity/QuizAnswer"
import { QuestionOption } from "../../../domain/entity/QuestionOption"

export class CreateQuizAnswer {
  constructor(private quizRepository: QuizRepository, private questionRepository: QuestionRepository) {}

  async execute(dto: Input): Promise<QuizAnswer> {
    if (!dto.quizId) {
      throw new Error("Quiz ID is required")
    }
    if (!dto.questionId) {
      throw new Error("Question ID is required")
    }
    const quiz = await this.validateQuiz(dto.quizId)
    const question = await this.validateQuestion(dto.questionId)
    const option = this.validateOption(dto.userOptionId, question)

    const correctAnswered = this.isUserAnswerCorrect(question, option, dto.userOptionId)

    const userQuizAnswer = QuizAnswer.create({
      quizId: dto.quizId,
      questionId: dto.questionId,
      topicId: question.topicId,
      correctOptionId: question.getCorrectOption()?.id ?? null,
      userOptionId: dto.userOptionId,
      isUserAnswerCorrect: correctAnswered,
    })
    await this.quizRepository.saveAnswer(userQuizAnswer)
    return userQuizAnswer
  }

  private async validateQuiz(quizId: string): Promise<Quiz> {
    const quiz = await this.quizRepository.getById(quizId)
    if (!quiz) {
      throw new Error(`Quiz ID:${quizId} does not exist!`)
    }
    return quiz
  }

  private async validateQuestion(questionId: string): Promise<Question> {
    const question = await this.questionRepository.getById(questionId)
    if (!question) {
      throw new Error(`Question ID:${questionId} does not exist!`)
    }
    return question
  }

  private validateOption(optionId: string, question: Question): QuestionOption {
    if (!optionId) return null
    const option = question.options.find(optionId)
    if (!option) {
      throw new Error(`Option ID:${optionId} does not exist!`)
    }
    return option
  }

  private isUserAnswerCorrect(question: Question, option: QuestionOption, optionId: string): boolean {
    if (question.isMultipleChoice) {
      return option?.isCorrectAnswer ?? false
    } else {
      const firstOption = question.options.getItems()[0]
      if (!optionId && !firstOption.isCorrectAnswer) {
        return true
      } else if (optionId === firstOption.id && firstOption.isCorrectAnswer) {
        return true
      }
      return false
    }
  }
}

type Input = {
  quizId: string
  questionId: string
  userOptionId: string
}
