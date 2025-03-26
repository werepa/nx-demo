import { CheckQuizAnswerOutputDTO } from "@simulex/models"
import { Discipline, QuestionOption, Question, QuizAnswer, User } from "../../../domain/entity"
import {
  DisciplineRepository,
  LearningRepository,
  QuestionRepository,
  QuizRepository,
  UserRepository,
} from "../../repository"

export class CheckQuizAnswer {
  private discipline: Discipline
  private user: User

  constructor(
    private userRepository: UserRepository,
    private disciplineRepository: DisciplineRepository,
    private questionRepository: QuestionRepository,
    private quizRepository: QuizRepository,
    private learningRepository: LearningRepository
  ) {}

  async execute(dto: CheckQuizAnswerInputDTO): Promise<CheckQuizAnswerOutputDTO> {
    this.user = await this.validateUser(dto.userId)
    this.discipline = await this.validateDiscipline(dto.disciplineId)

    const learning = await this.learningRepository.getDisciplineLearning(this.user, this.discipline)

    const question = await this.questionRepository.getById(dto.userQuizAnswer?.questionId)
    if (!question) throw new Error(`Question ID:${dto.userQuizAnswer.questionId} does not exist`)

    const isUserAnswerCorrect = this.isCorrectQuizAnswer(question, dto.userQuizAnswer.userOptionId)

    const userQuizAnswer = QuizAnswer.create({
      quizId: dto.userQuizAnswer.quizId,
      questionId: dto.userQuizAnswer.questionId,
      topicId: dto.userQuizAnswer.topicId || question.topicId,
      correctOptionId: question.getCorrectOption()?.id ?? null,
      userOptionId: dto.userQuizAnswer.userOptionId,
      isUserAnswerCorrect: isUserAnswerCorrect,
    })
    await this.quizRepository.saveAnswer(userQuizAnswer)
    learning.history.add(userQuizAnswer)
    await this.learningRepository.save(learning)

    const sameTopicQuestions = learning.history
      .getItems()
      .filter((qa) => qa.topicId === question.topicId)
      .map((qa) => ({
        questionId: qa.questionId,
        isUserAnswerCorrect: qa.isUserAnswerCorrect,
      }))

    const output: CheckQuizAnswerOutputDTO = {
      questionId: question.id,
      userOptionId: dto.userQuizAnswer.userOptionId || null,
      correctOptionId: question.options.getItems().find((o: QuestionOption) => o.isCorrectAnswer)?.optionId || null,
      isUserAnswerCorrect: isUserAnswerCorrect,
      topic: {
        topicId: question.topicId,
        topicName: learning.discipline.topic({ topicId: question.topicId }).name,
        topicRootId: learning.discipline.topic({
          topicId: question.topicRootId,
        }).topicId,
        topicRootName: learning.discipline.topic({
          topicId: question.topicRootId,
        }).name,
        history: sameTopicQuestions,
      },
      linkedTopics: [
        question.linkedTopics.map((topicId: string) => ({
          topicId,
          topicName: learning.discipline.topic({ topicId }).name,
        }))[0] || { topicId: "", topicName: "" },
      ],
    }
    return output
  }

  private isCorrectQuizAnswer = (question: Question, optionId: string): boolean => {
    if (question.options.getItems().length === 0) {
      throw new Error("Questions must be at least one option")
    }
    if (question.isMultipleChoice) {
      const option = question.options.getItems().find((option: QuestionOption) => option.id === optionId)
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

  private async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.getById(userId)
    if (!user) {
      throw new Error(`User ID:${userId} does not exist!`)
    }
    return user
  }

  private async validateDiscipline(disciplineId: string): Promise<Discipline> {
    const discipline = await this.disciplineRepository.getById(disciplineId)
    if (!discipline) {
      throw new Error(`Discipline ID:${disciplineId} does not exist!`)
    }
    return discipline
  }
}

export type CheckQuizAnswerInputDTO = {
  disciplineId: string
  userId: string
  userQuizAnswer: {
    quizId: string
    questionId: string
    userOptionId?: string
    topicId?: string
  }
}
