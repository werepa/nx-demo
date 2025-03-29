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
import { Discipline, Topic, QuizAnswer, User, Learning, TopicLearning, QuestionOption } from "../../domain/entity"
import { QuizType } from "../../domain/valueObject"

export type UserState = {
  userId: string
  name: string
  email: string
  password: string
  role: string
  image: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date | null
}

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

export type QuestionState = {
  questionId: string
  topicId: string
  prompt: string
  isMultipleChoice: boolean
  options: QuestionOption[]
  topicRootId: string
  difficulty?: number
  qtyAnswered?: number
  qtyCorrectAnswers?: number
  difficultyRecursive?: number
  simulexHash?: string
  linkedTopics?: string[]
  year?: string
  sourceId?: string
  isActive?: boolean
  createdBy?: string
  createdAt?: Date
}

// TODO: substituir key por isCorrectAnswer no DB de desenvolvimento e produção
export type QuestionOptionState = {
  optionId: string
  text: string
  isCorrectAnswer?: boolean
  key?: boolean
  item: number
  obs: string
  questionId: string
}

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

export type QuizAnswerState = {
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

export type LearningState = {
  learningId: string
  user: User
  discipline: Discipline
  topicsLearning: TopicLearning[]
  history: QuizAnswer[]
}

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
