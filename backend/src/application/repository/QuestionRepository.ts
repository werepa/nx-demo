import { Question } from "../../domain/entity/Question"

export interface QuestionRepository {
  save(question: Question): Promise<void>
  getAll({ topicId, showAll }?: { topicId?: string; showAll?: boolean }): Promise<Question[]>
  getById(questionId: string): Promise<Question | null>
  getRandom({
    topicId,
    userId,
    topicsRoot,
  }: {
    topicId: string
    userId: string
    topicsRoot: string[]
  }): Promise<Question | null>
  getByHash(simulexHash: string): Promise<Question | null>
  getDisciplineStatistics(disciplineId: string): Promise<QuestionDisciplineStatistics>
  migrateOptions(): Promise<{ updatedCount: number; deactivatedCount: number }>
}

export type QuestionDisciplineStatistics = {
  disciplineId: string
  topics: TopicStatistics[]
}

export type TopicStatistics = {
  topicId: string
  qtyQuestions: number
}
