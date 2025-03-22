import { Quiz } from "../../domain/entity/Quiz"
import { QuizAnswer } from "../../domain/entity/QuizAnswer"

export interface QuizRepository {
  save(quiz: Quiz): Promise<void>
  saveAnswer(userQuizAnswer: QuizAnswer): Promise<void>
  getById(quizId: string): Promise<Quiz | null>
  getAll({ userId, disciplineId, showAll }?: { userId: string; disciplineId?: string; showAll?: boolean }): Promise<Quiz[]>
  resetCanRepeat(userId: string, topicId: string): Promise<void>
  clear(): Promise<void>
}
