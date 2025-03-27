import { LearningRepository } from "../../application/repository/LearningRepository"
import { Learning } from "../../domain/entity/Learning"
import { Topic } from "../../domain/entity/Topic"
import { QuizAnswer } from "../../domain/entity/QuizAnswer"
import { TopicLearning } from "../../domain/entity/TopicLearning"
import { Discipline } from "../../domain/entity/Discipline"
import { User } from "../../domain/entity/User"
import { DateBr } from "../../shared/domain/valueObject/DateBr"
import { DatabaseConnection } from "../database"
import { LearningState, TopicLearningState } from "../../shared/models"
import { randomUUID } from "crypto"

interface QuestionStatsByTopic {
  topicId: string
  qtyAnswered: number
  qtyCorrectAnswered: number
  avgGrade: number
}

interface DisciplineStats {
  topic_id: string
  qty_questions: number
}

interface RawTopicLearning {
  user_topic_learning_id: string
  user_id: string
  topic_id: string
  score: number
  avg_grade: number
  level_in_topic: number
  qty_questions_answered: number
}
interface RawQuizAnswer {
  quiz_answer_id: string
  quiz_id: string
  topic_id: string
  question_id: string
  user_option_id: string
  is_user_answer_correct: boolean | number
  can_repeat: boolean | number
  created_at: DateBr
  correct_option_id: string
}

interface DisciplineHistory {
  quiz_answer_id: string
  quiz_id: string
  topic_id: string
  question_id: string
  user_option_id: string
  is_user_answer_correct: boolean | number
  can_repeat: boolean | number
  created_at: DateBr
  correct_option_id: string
}
interface RawCollectiveTopicLearning {
  topic_id: string
  collective_avg_grade: number
  collective_avg_score: number
}

interface TopicStats {
  topic_id: string
  qty_questions: number
}

export class LearningRepositoryDatabase implements LearningRepository {
  constructor(private readonly connection: DatabaseConnection) {}

  async getDisciplineLearning(user: User, discipline: Discipline): Promise<Learning> {
    if (!user || !discipline) throw new Error("User and Discipline are required")
    const disciplineStatsFromDB = await this.fetchDisciplineStats(discipline.disciplineId)
    const disciplineLearningFromDB = await this.fetchDisciplineLearning({
      userId: user.userId,
      disciplineId: discipline.disciplineId,
    })
    const disciplineCollectiveLearningFromDB = await this.fetchCollectiveDisciplineLearning({
      disciplineId: discipline.disciplineId,
    })
    const disciplineHistoryFromDB = await this.fetchDisciplineHistory({
      userId: user.userId,
      disciplineId: discipline.disciplineId,
    })
    const learning = this.convertDatabaseLearning(
      disciplineStatsFromDB,
      disciplineLearningFromDB,
      disciplineCollectiveLearningFromDB,
      disciplineHistoryFromDB,
      user,
      discipline
    )

    this.updateTopicsFrequencies(learning)
    this.updateTopicsDifficultyRecursive(learning)

    return learning
  }

  async save(learning: Learning): Promise<void> {
    if (learning.history.getItems().length === 0) {
      throw new Error("Learning history is empty")
    }
    const lastQuestionAnswer = learning.history.getShortHistory(1)[0]
    const lastQuestionAnswerTopic = learning.discipline.topic({
      topicId: lastQuestionAnswer.topicId,
    })
    // atualiza os tópicos com mesmo topicRootId
    learning.topics
      .getItems()
      .filter((topicLearning) => topicLearning.topic.topicRootId === lastQuestionAnswerTopic?.topicRootId)
      .forEach(async (topicLearning) => {
        const existingTopicLearning = await this.existTopicLearning({
          userId: topicLearning.userId,
          topicId: topicLearning.topic.topicId,
        })
        if (existingTopicLearning) {
          await this.updateTopicLearning(topicLearning)
        } else {
          await this.insertTopicLearning(topicLearning)
        }
      })
  }

  private async insertTopicLearning(topicLearning: TopicLearning): Promise<void> {
    const query = `
      INSERT INTO user_topic_learnings (
        user_topic_learning_id, user_id, topic_id, score, avg_grade, level_in_topic, qty_questions_answered
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const params = [
      topicLearning.topicLearningId,
      topicLearning.userId,
      topicLearning.topic.topicId,
      topicLearning.score(),
      topicLearning.avgGrade(),
      topicLearning.levelInTopic(),
      topicLearning.qtyQuestionsAnswered(),
    ]
    await this.connection.run(query, params)
  }

  private async updateTopicLearning(topicLearning: TopicLearning): Promise<void> {
    const query = `
      UPDATE user_topic_learnings SET
        user_id = ?, topic_id = ?, score = ?, avg_grade = ?, level_in_topic = ?, qty_questions_answered = ?
      WHERE user_topic_learning_id = ?
    `
    const params = [
      topicLearning.userId,
      topicLearning.topic.topicId,
      topicLearning.score(),
      topicLearning.avgGrade(),
      topicLearning.levelInTopic(),
      topicLearning.qtyQuestionsAnswered(),
      topicLearning.topicLearningId,
    ]
    await this.connection.run(query, params)
  }

  private async fetchDisciplineStats(disciplineId: string): Promise<DisciplineStats[]> {
    const query = `
      SELECT q.topic_id, count(q.question_id) as qty_questions
      FROM questions q
      JOIN topics t ON q.topic_id = t.topic_id
      WHERE t.discipline_id = ? AND q.is_active = ${this.dbType(1)}
      GROUP BY q.topic_id
      `
    return this.connection.all(query, [disciplineId])
  }

  private async existTopicLearning(dto: { userId: string; topicId: string }): Promise<boolean> {
    const query = `
    SELECT * FROM user_topic_learnings WHERE user_id = ? AND topic_id = ?
    `
    const result = await this.connection.all(query, [dto.userId, dto.topicId])
    return result.length > 0
  }

  private async fetchDisciplineLearning(dto: { userId: string; disciplineId: string }): Promise<RawTopicLearning[]> {
    const query = `
      SELECT utl.* FROM user_topic_learnings utl
      JOIN topics t ON utl.topic_id = t.topic_id
      WHERE utl.user_id = ? AND t.discipline_id = ?
      `
    return this.connection.all(query, [dto.userId, dto.disciplineId])
  }

  private async fetchCollectiveDisciplineLearning(dto: { disciplineId: string }): Promise<RawCollectiveTopicLearning[]> {
    const query = `
      SELECT utl.topic_id, AVG(utl.avg_grade) as collective_avg_grade, AVG(utl.score) as collective_avg_score
      FROM user_topic_learnings utl
      JOIN topics t ON utl.topic_id = t.topic_id
      WHERE t.discipline_id = ? AND utl.qty_questions_answered > 2
      GROUP BY utl.topic_id
      `
    return this.connection.all(query, [dto.disciplineId])
  }

  private async fetchDisciplineHistory(dto: { userId: string; disciplineId: string }): Promise<DisciplineHistory[]> {
    const query = `
      SELECT t.topic_id, qa.* FROM quiz_answers qa
      JOIN questions q ON qa.question_id = q.question_id
      JOIN quizzes qz ON qa.quiz_id = qz.quiz_id
      JOIN topics t ON q.topic_id = t.topic_id
      WHERE qz.user_id = ? AND t.discipline_id = ?
      `
    return this.connection.all(query, [dto.userId, dto.disciplineId])
  }

  private convertDatabaseLearning(
    disciplineStats: DisciplineStats[],
    disciplineLearningFromDB: RawTopicLearning[],
    disciplineCollectiveLearningFromDB: RawCollectiveTopicLearning[],
    disciplineHistoryFromDB: DisciplineHistory[],
    user: User,
    discipline: Discipline
  ): Learning {
    const learning = Learning.create({ discipline, user })
    disciplineStats.forEach((topicStats: TopicStats) => {
      const topicLearningFromDB = disciplineLearningFromDB?.find((t: RawTopicLearning) => t.topic_id === topicStats.topic_id)
      const topicCollectiveLearningFromDB = disciplineCollectiveLearningFromDB.find(
        (t: RawCollectiveTopicLearning) => t.topic_id === topicStats.topic_id
      )
      const topicLearning = TopicLearning.toDomain({
        topicLearningId: topicLearningFromDB?.user_topic_learning_id || randomUUID(),
        userId: user.userId,
        topic: discipline.topic({ topicId: topicStats.topic_id }),
        levelInTopic: topicLearningFromDB?.level_in_topic,
        qtyQuestions: topicStats.qty_questions,
        qtyQuestionsRecursive: null,
        qtyAllQuestionsDepth: null,
        maxQtyAllQuestionsDepth: null,
        maxQtyAllQuestionsRootRecursive: null,
        frequencyInDepth: null,
        frequencyInDiscipline: null,
        difficultyRecursive: null,
        collectiveAvgGrade: topicCollectiveLearningFromDB?.collective_avg_grade
          ? topicCollectiveLearningFromDB.collective_avg_grade
          : null,
        collectiveAvgScore: topicCollectiveLearningFromDB?.collective_avg_score,
        parent: learning,
      })
      const topic = learning.topics.findByTopicId(topicLearning.topic.topicId)
      if (topic) learning.topics.remove(topic)
      learning.topics.add(topicLearning)
    })
    disciplineHistoryFromDB.forEach((quizAnswerFromDB: RawQuizAnswer) =>
      learning.history.add(
        QuizAnswer.toDomain({
          quizAnswerId: quizAnswerFromDB.quiz_answer_id,
          quizId: quizAnswerFromDB.quiz_id,
          topicId: quizAnswerFromDB.topic_id,
          questionId: quizAnswerFromDB.question_id,
          userOptionId: quizAnswerFromDB.user_option_id,
          isUserAnswerCorrect: quizAnswerFromDB.is_user_answer_correct === this.dbType(1),
          canRepeat: quizAnswerFromDB.can_repeat === this.dbType(1),
          createdAt: DateBr.create(quizAnswerFromDB.created_at).value,
          correctOptionId: quizAnswerFromDB.correct_option_id || "",
        })
      )
    )
    return learning
  }

  private updateTopicsFrequencies(learning: Learning): void {
    learning.discipline.topics.getItems().forEach((topic: Topic) => {
      const topicLearning = learning.topics.findByTopicId(topic.topicId)
      if (!topicLearning) return
      const qtyQuestions = topicLearning.qtyQuestions
      const qtyQuestionsRecursive = this.calculateqtyQuestionsRecursive(topic.topicId, learning)
      topicLearning.setQtyQuestionsRecursive(qtyQuestionsRecursive)
      const qtyAllQuestionsDepth = qtyQuestions + qtyQuestionsRecursive
      topicLearning.setQtyAllQuestionsDepth(qtyAllQuestionsDepth)
      const maxQtyAllQuestionsDepth = this.calculateMaxQtyAllQuestionsInDepth(topic.depth, learning)
      topicLearning.setMaxQtyAllQuestionsDepth(maxQtyAllQuestionsDepth)
      const maxQtyAllQuestionsRootRecursive = this.calculateMaxQtyAllQuestionsRootRecursive(learning)
      topicLearning.setMaxQtyAllQuestionsRootRecursive(maxQtyAllQuestionsRootRecursive)
      const frequencyInDepth = Number(
        (
          (qtyAllQuestionsDepth / maxQtyAllQuestionsDepth) *
          Math.pow(10, learning.discipline.maxTopicsDepth() - topic.depth)
        ).toFixed(4)
      )
      topicLearning.setFrequencyInDepth(frequencyInDepth)
      const frequencyInDiscipline = Number((qtyAllQuestionsDepth / maxQtyAllQuestionsRootRecursive).toFixed(4))
      topicLearning.setFrequencyInDiscipline(frequencyInDiscipline)
    })
  }

  private updateTopicsDifficultyRecursive(learning: Learning): void {
    learning.discipline.topics.getItems().forEach((topic: Topic) => {
      this.updateTopicDifficultyRecursive(topic, learning)
    })
  }

  private updateTopicDifficultyRecursive(topic: Topic, learning: Learning): void {
    const topicLearning = learning.topics.findByTopicId(topic.topicId)
    if (!topicLearning) return
    const difficultyRecursive = this.calculateDifficultyRecursive(topic.topicId, learning)
    topicLearning.setDifficultyRecursive(difficultyRecursive)
  }

  private calculateDifficultyRecursive(topicId: string, learning: Learning): number | null {
    let qty = 0
    let difficultyRecursive = 0
    const qtyQuestionsAnswered = learning.topics.findByTopicId(topicId)?.qtyQuestionsAnswered() || 0
    if (qtyQuestionsAnswered > 2) {
      difficultyRecursive = learning.topics.findByTopicId(topicId)?.difficulty ?? 50
      qty++
    }
    learning.discipline.topicsChildrenRecursive(topicId).forEach((topic: Topic) => {
      const topicLearning = learning.topics.findByTopicId(topic.topicId)
      if (topicLearning?.qtyQuestionsAnswered) {
        difficultyRecursive += topicLearning.difficulty
        qty++
      }
    })
    return qty ? Number((difficultyRecursive / qty).toFixed(4)) : null
  }

  private calculateMaxQtyAllQuestionsInDepth(depth: number, learning: Learning): number {
    let maxQtyAllQuestionsDepth = 0
    learning.discipline.topics
      .getItems()
      .filter((topic: Topic) => topic.depth === depth)
      .map((topic: Topic) => {
        const topicLearning = learning.topics.findByTopicId(topic.topicId)
        if (!topicLearning) return
        const qtyAllQuestionsDepth =
          topicLearning.qtyQuestions + this.calculateqtyQuestionsRecursive(topic.topicId, learning)
        if (qtyAllQuestionsDepth > maxQtyAllQuestionsDepth) maxQtyAllQuestionsDepth = qtyAllQuestionsDepth
      })
    return maxQtyAllQuestionsDepth
  }

  private calculateqtyQuestionsRecursive(topicId: string, learning: Learning): number {
    let qtyQuestionsRecursive = 0
    learning.discipline.topicsChildrenRecursive(topicId).forEach((topic: Topic) => {
      const topicLearning: TopicLearning = learning.topics.findByTopicId(topic.topicId)
      if (!topicLearning) return
      qtyQuestionsRecursive += topicLearning.qtyQuestions
    })
    return qtyQuestionsRecursive
  }

  private calculateMaxQtyAllQuestionsRootRecursive(learning: Learning): number {
    let maxQtyAllQuestionsRootRecursive = 0
    learning.discipline.topics
      .getItems()
      .filter((topic: Topic) => topic.isRoot())
      .map((topic: Topic) => {
        const topicLearning = learning.topics.findByTopicId(topic.topicId)
        if (!topicLearning) return
        const qtyAllQuestionsRoot = topicLearning.qtyQuestions + this.calculateqtyQuestionsRecursive(topic.topicId, learning)
        if (qtyAllQuestionsRoot > maxQtyAllQuestionsRootRecursive) maxQtyAllQuestionsRootRecursive = qtyAllQuestionsRoot
      })
    return maxQtyAllQuestionsRootRecursive
  }

  private dbType(value: number): boolean | number {
    return this.connection.databaseType() === "postgres" ? Boolean(value) : value
  }

  private getQuestionStatsByTopic(userId: string, disciplineId: string): Promise<QuestionStatsByTopic[]> {
    return this.connection.all<QuestionStatsByTopic>(
      `
      SELECT 
        q.topic_id as "topicId",
        COUNT(qa.quiz_answer_id) as "qtyAnswered",
        SUM(CASE WHEN qa.correct_answered THEN 1 ELSE 0 END) as "qtyCorrectAnswered",
        AVG(CASE WHEN qa.correct_answered THEN 1 ELSE 0 END) as "avgGrade"
      FROM questions q
      LEFT JOIN quiz_answers qa ON qa.question_id = q.question_id AND qa.user_id = ? '
      WHERE q.discipline_id = ? '
      GROUP BY q.topic_id
    `,
      [userId, disciplineId]
    )
  }

  private mapToDomain(learningData: LearningState): Learning {
    return Learning.toDomain(learningData)
  }

  private mapToTopicLearningDomain(data: TopicLearningState): TopicLearning {
    return TopicLearning.toDomain(data)
  }
}
