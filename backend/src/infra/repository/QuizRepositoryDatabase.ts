import { DisciplineRepository, QuizRepository, UserRepository } from "../../application/repository"
import { Quiz, QuizAnswer } from "../../domain/entity"
import { QuizType } from "../../domain/valueObject"
import { DateBr } from "../../shared/domain/valueObject"
import { QuizState } from "../../shared/models"
import { DatabaseConnection } from "../database"

interface QuizRow {
  quiz_id: string
  quiz_type: string
  user_id: string
  discipline_id: string
  topics_id: string
  is_active: number | boolean
  created_at: string
  updated_at: string | null
}

interface QuizAnswerRow {
  quiz_answer_id: string
  quiz_id: string
  question_id: string
  topic_id: string
  correct_option_id: string
  user_option_id: string
  is_user_answer_correct: number | boolean
  can_repeat: number | boolean
  created_at: string
}

export class QuizRepositoryDatabase implements QuizRepository {
  constructor(
    private readonly connection: DatabaseConnection,
    private userRepository: UserRepository,
    private disciplineRepository: DisciplineRepository
  ) {}

  async save(quiz: Quiz): Promise<void> {
    const existingQuiz = await this.getById(quiz.quizId)
    if (existingQuiz) {
      const query =
        "UPDATE quiz SET quiz_type = ?, user_id = ?, discipline_id = ?, topics_id = ?, is_active = ?, updated_at = ? WHERE quiz_id = ?"
      const params = [
        quiz.quizType.value,
        quiz.user.userId,
        quiz.discipline.disciplineId,
        JSON.stringify(quiz.topicsRoot.listId()),
        quiz.isActive ? this.dbType(1) : this.dbType(0),
        quiz.updatedAt ? quiz.updatedAt.value.toISOString() : DateBr.create().value.toISOString(),
        quiz.quizId,
      ]
      await this.connection.run(query, params)
      return
    }

    const query =
      "INSERT INTO quiz (quiz_id, quiz_type, user_id, discipline_id, topics_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    const params = [
      quiz.quizId,
      quiz.quizType.value,
      quiz.user.userId,
      quiz.discipline.disciplineId,
      JSON.stringify(quiz.topicsRoot.listId()),
      quiz.isActive ? this.dbType(1) : this.dbType(0),
      quiz.createdAt ? quiz.createdAt.value.toISOString() : DateBr.create().value.toISOString(),
      quiz.updatedAt ? quiz.updatedAt.value.toISOString() : null,
    ]
    await this.connection.run(query, params)
  }

  async saveAnswer(quizAnswer: QuizAnswer): Promise<void> {
    const query = `INSERT INTO quiz_answer (
      quiz_answer_id,
      quiz_id,
      question_id,
      correct_option_id,
      user_option_id,
      is_user_answer_correct,
      can_repeat,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

    const params = [
      quizAnswer.quizAnswerId,
      quizAnswer.quizId,
      quizAnswer.questionId,
      quizAnswer.correctOptionId,
      quizAnswer.userOptionId,
      quizAnswer.isUserAnswerCorrect ? this.dbType(1) : this.dbType(0),
      quizAnswer.canRepeat ? this.dbType(1) : this.dbType(0),
      quizAnswer.createdAt ? quizAnswer.createdAt.value.toISOString() : DateBr.create().value.toISOString(),
    ]
    await this.connection.run(query, params)
  }

  async getAll(
    { userId, disciplineId, showAll }: { userId: string; disciplineId?: string; showAll?: boolean } = {
      userId: null,
      disciplineId: null,
      showAll: false,
    }
  ): Promise<Quiz[]> {
    const queryParts = [`SELECT * FROM quiz WHERE ${this.dbType(1)}`]
    if (userId) queryParts.push(`AND user_id = '${userId}'`)
    if (disciplineId) queryParts.push(`AND discipline_id = '${disciplineId}'`)
    if (!showAll) queryParts.push(`AND is_active = ${this.dbType(1)}`)
    queryParts.push("ORDER BY created_at DESC LIMIT 100")
    const query = queryParts.join(" ")
    const quizzesFromDB = (await this.connection.all(query)) as QuizRow[]
    return Promise.all(
      quizzesFromDB.map(async (quizFromDB: QuizRow) => {
        const user = await this.userRepository.getById(quizFromDB.user_id)

        const discipline = await this.disciplineRepository.getById(quizFromDB.discipline_id)

        const quizState: QuizState = {
          quizId: quizFromDB.quiz_id,
          quizType: QuizType.create(quizFromDB.quiz_type),
          user,
          discipline,
          answers: [],
          isActive: !!quizFromDB.is_active,
          createdAt: DateBr.create(quizFromDB.created_at).value,
          updatedAt: quizFromDB.updated_at ? DateBr.create(quizFromDB.updated_at).value : null,
          topicsRootId: [],
        }
        return Quiz.toDomain(quizState)
      })
    )
  }

  async getById(quizId: string): Promise<Quiz | null> {
    const query = "SELECT * FROM quiz WHERE quiz_id = ?"
    const quizFromDB = (await this.connection.get(query, quizId)) as QuizRow
    if (!quizFromDB) return null
    const user = await this.userRepository.getById(quizFromDB.user_id)
    const discipline = await this.disciplineRepository.getById(quizFromDB.discipline_id)
    const answers = await this.getAnswers(quizId)
    const quizState: QuizState = {
      quizId: quizFromDB.quiz_id,
      quizType: QuizType.create(quizFromDB.quiz_type),
      user,
      discipline,
      answers,
      isActive: !!quizFromDB.is_active,
      createdAt: DateBr.create(quizFromDB.created_at).value,
      updatedAt: quizFromDB.updated_at ? DateBr.create(quizFromDB.updated_at).value : null,
      topicsRootId: [],
    }
    return Quiz.toDomain(quizState)
  }

  async getAnswers(quizId: string): Promise<QuizAnswer[]> {
    const query = "SELECT * FROM quiz_answer WHERE quiz_id = ? ORDER BY created_at ASC"
    const answersFromDB = (await this.connection.all(query, [quizId])) as QuizAnswerRow[]
    return answersFromDB.map((answerFromDB) => {
      return QuizAnswer.toDomain({
        quizAnswerId: answerFromDB.quiz_answer_id,
        quizId: answerFromDB.quiz_id,
        questionId: answerFromDB.question_id,
        topicId: answerFromDB.topic_id,
        correctOptionId: answerFromDB.correct_option_id,
        userOptionId: answerFromDB.user_option_id,
        isUserAnswerCorrect: !!answerFromDB.is_user_answer_correct,
        canRepeat: !!answerFromDB.can_repeat,
        createdAt: DateBr.create(answerFromDB.created_at).value,
      })
    })
  }

  async resetCanRepeat(userId: string, topicId: string): Promise<void> {
    const query = `UPDATE quiz_answer SET can_repeat = ${this.dbType(
      1
    )} WHERE quiz_id IN (SELECT quiz_id FROM quiz WHERE user_id = ?) AND question_id IN (SELECT question_id FROM question WHERE topic_id = ?)`
    return this.connection.run(query, [userId, topicId])
  }

  async clear(): Promise<void> {
    if (process.env["NODE_ENV"] === "production") return

    if (this.connection.databaseType() === "postgres") {
      const tables = ["quiz_answer,quiz"]
      const truncateQuery = `TRUNCATE TABLE ${tables.map((table) => `public.${table}`).join(", ")} CASCADE`
      return this.connection.run(truncateQuery)
    } else {
      await this.connection.run("DELETE FROM quiz_answer")
      return this.connection.run("DELETE FROM quiz")
    }
  }

  private dbType(value: number): any {
    return this.connection.databaseType() === "postgres" ? Boolean(value) : value
  }
}
