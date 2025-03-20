import {
  UserDTO,
  DisciplineDTO,
  TopicDTO,
  QuestionDTO,
  QuestionOptionDTO,
  QuizDTO,
  QuizAnswerDTO,
  LearningDTO,
  TopicLearningDTO,
} from "@simulex/models"
import { Discipline, Topic, QuizAnswer, User, Learning } from "../../domain/entity"
import { QuizType } from "../../domain/valueObject"

export type UserState = UserDTO

export type DisciplineState = {
  disciplineId: string
  name: string
  topics: TopicState[]
  image: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date | null
}

export type TopicState = {
  topicId: string
  disciplineId: string
  name: string
  isTopicClassify: boolean
  topicParentId: string
  topicRootId: string
  depth: number
  dependencies: string[]
  obs: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date | null
}

export type QuestionState = QuestionDTO
export type QuestionOptionState = QuestionOptionDTO
export type QuizState = {
  quizId: string
  user: User
  discipline: Discipline
  topicsRootId: string[]
  quizType: QuizType
  answers: QuizAnswer[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date | null
}
export type QuizAnswerState = QuizAnswerDTO
export type LearningState = LearningDTO

export type TopicLearningState = {
  topicLearningId: string
  userId: string
  topic: Topic
  score?: number
  levelInTopic: number
  learning?: number
  learningLabel?: string
  learningSource?: number
  learningSourceLabel?: string
  qtyQuestions: number
  qtyQuestionsRecursive: number
  qtyAllQuestionsDepth: number
  maxQtyAllQuestionsDepth: number
  maxQtyAllQuestionsRootRecursive: number
  frequencyInDepth: number
  frequencyInDiscipline: number
  difficultyRecursive: number
  collectiveAvgGrade: number | null
  collectiveAvgScore: number | null
  qtyQuestionsAnswered?: number
  qtyQuestionsCorrectAnswered?: number
  isLastQuestionCorrectAnswered?: boolean | null
  avgGrade?: number | null
  srs?: number
  history?: QuizAnswer[]
  parent: Learning
}
