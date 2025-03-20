import { DisciplineDTO } from "./DisciplineDTO"
import { TopicDTO } from "./TopicDTO"

export type CreateQuizDTO = {
  userId: string
  disciplineId: string
  quizType?: string
}

export type QuizDTO = {
  quizId: string
  userId: string
  discipline: DisciplineDTO
  topicsRoot: TopicDTO[]
  quizType: string
  answers: QuizAnswerDTO[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date | null
}

export type QuizUpdateDTO = {
  topicsRoot?: string[]
  quizType?: string
  isActive?: boolean
}

// export type CreateQuizAnswerDTO = {
//   quizId: string
//   questionId: string
//   topicId: string
//   optionId: string | null
//   correctAnswered?: boolean
// }

export type QuizAnswerDTO = {
  quizAnswerId: string
  quizId: string
  questionId: string
  topicId: string
  correctOptionId: string | null
  userOptionId: string | null
  isUserAnswerCorrect: boolean
  canRepeat: boolean
  createdAt: Date
}

export type CheckQuizAnswerInputDTO = {
  disciplineId: string
  userId: string
  userQuizAnswer: {
    quizId: string
    questionId: string
    userOptionId?: string
  }
}

export type CheckQuizAnswerOutputDTO = {
  questionId: string
  correctOptionId: string | null
  userOptionId: string | null
  isUserAnswerCorrect: boolean
  topic: {
    topicId: string
    topicName: string
    topicRootId: string
    topicRootName: string
    history: {
      questionId: string
      isUserAnswerCorrect: boolean
    }[]
  }
  linkedTopics: [
    {
      topicId: string
      topicName: string
    }
  ]
}
