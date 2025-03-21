import { faker } from "@faker-js/faker"
import { Quiz, QuizAnswer } from "../../domain/entity"
import { QuizDTO, QuizAnswerDTO } from "@simulex/models"
import { userMock, disciplineMockState, disciplineMock } from "."
import { QuizState } from "../../shared/models"
import { QuizType } from "../../domain/valueObject"

interface QuizMockOptions {
  quizId?: string
  userId?: string
  disciplineId?: string
  quizType?: string
  isActive?: boolean
}

interface QuizAnswerMockOptions {
  quizAnswerId?: string
  quizId?: string
  questionId?: string
  topicId?: string
  correctOptionId?: string | null
  userOptionId?: string | null
  isUserAnswerCorrect?: boolean
  canRepeat?: boolean
}

export const quizMockState = (options: QuizMockOptions = {}): QuizState => {
  const quizId = options.quizId || faker.string.uuid()
  const userId = options.userId || faker.string.uuid()
  const disciplineId = options.disciplineId || faker.string.uuid()
  const createdAt = faker.date.recent()

  return {
    quizId,
    user: userMock({ userId }),
    discipline: disciplineMock({ disciplineId }),
    topicsRootId: [],
    quizType: QuizType.create(options.quizType || "random"),
    answers: [],
    isActive: options.isActive !== undefined ? options.isActive : true,
    createdAt,
    updatedAt: null,
  }
}

export const quizMock = (options: QuizMockOptions = {}): Quiz => {
  const user = userMock()
  const quizDTO: QuizState = quizMockState({ ...options, userId: user.userId })
  return Quiz.toDomain(quizDTO)
}

export const quizAnswerMockState = (options: QuizAnswerMockOptions = {}): QuizAnswerDTO => {
  const quizAnswerId = options.quizAnswerId || faker.string.uuid()
  const createdAt = faker.date.recent()

  return {
    quizAnswerId,
    quizId: options.quizId || faker.string.uuid(),
    questionId: options.questionId || faker.string.uuid(),
    topicId: options.topicId || faker.string.uuid(),
    correctOptionId: options.correctOptionId || null,
    userOptionId: options.userOptionId || null,
    isUserAnswerCorrect: options.isUserAnswerCorrect !== undefined ? options.isUserAnswerCorrect : false,
    canRepeat: options.canRepeat !== undefined ? options.canRepeat : true,
    createdAt,
  }
}

export const quizAnswerState = (answer: QuizAnswer): QuizAnswerDTO => {
  return {
    quizAnswerId: answer.id,
    quizId: answer.quizId,
    questionId: answer.questionId,
    topicId: answer.topicId,
    correctOptionId: answer.correctOptionId,
    userOptionId: answer.userOptionId,
    isUserAnswerCorrect: answer.isUserAnswerCorrect,
    canRepeat: answer.canRepeat,
    createdAt: answer.createdAt.value,
  }
}

// export const checkQuizAnswerList = async (
//   answerList: QuizAnswerDTO[],
//   discipline: Discipline,
//   questionRepository: QuestionRepository,
//   quizRepository: QuizRepository
// ): Promise<void> => {
//   const uniqueUserIds = Array.from(new Set(answerList.map((answer) => answer.user)))

//   uniqueUserIds.forEach(async (user) => {
//     const quiz = Quiz.create({
//       user,
//       discipline,
//     })
//     discipline.topicsRoot().forEach((topic: Topic) => {
//       quiz.topicsRoot.add(topic)
//     })
//     await quizRepository.save(quiz)

//     let questions = await questionRepository.getAll({})
//     const baseDate = new Date()
//     answerList
//       .filter((answer) => answer.user === user)
//       .forEach(async (answer, index) => {
//         const question = questions.find((question) => question.topicId === answer.topicId)
//         if (!question) return
//         const quizAnswerState: QuizAnswerDTO = {
//           quizAnswerId: faker.string.uuid(),
//           quizId: quiz.quizId,
//           questionId: question.questionId,
//           topicId: question.topicId,
//           correctOptionId: getCorrectOption(question),
//           userOptionId: answer.isUserAnswerCorrect ? getCorrectOption(question) : getIncorrectOption(question),
//           isUserAnswerCorrect: answer.isUserAnswerCorrect,
//           canRepeat: false,
//           createdAt: new Date(baseDate.getTime() + index),
//         }
//         await quizRepository.saveAnswer(QuizAnswer.toDomain(quizAnswerState))
//         questions = questions.filter((q) => q.questionId !== question.questionId)
//       })
//   })
//   return Promise.resolve()
// }
