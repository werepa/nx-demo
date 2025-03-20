import { QuizAnswerDTO } from "./QuizDTO"
import { TopicDTO } from "./TopicDTO"

export type TopicLearningDTO = {
  topicLearningId: string
  userId: string
  topic: TopicDTO
  score: number
  levelInTopic: number
  learning: number
  learningLabel: string
  learningSource: number
  learningSourceLabel: string
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
  qtyQuestionsAnswered: number
  qtyQuestionsCorrectAnswered: number
  isLastQuestionCorrectAnswered: boolean | null
  avgGrade: number | null
  srs: number
  history: QuizAnswerDTO[]
}
