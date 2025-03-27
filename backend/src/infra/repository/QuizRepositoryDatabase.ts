import { DisciplineRepository, QuizRepository, UserRepository } from "../../application/repository"
import { Discipline, Quiz, QuizAnswer, User } from "../../domain/entity"
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
        "UPDATE quizzes SET quiz_type = ?, user_id = ?, discipline_id = ?, topics_id = ?, is_active = ?, updated_at = ? WHERE quiz_id = ?"
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
      "INSERT INTO quizzes (quiz_id, quiz_type, user_id, discipline_id, topics_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
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

  async saveAnswer(userQuizAnswer: QuizAnswer): Promise<void> {
    const query =
      "INSERT INTO quiz_answers (quiz_answer_id, quiz_id, question_id, selected_option_id, is_correct_answer, can_repeat, answered_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    const params = [
      userQuizAnswer.quizAnswerId,
      userQuizAnswer.quizId,
      userQuizAnswer.questionId,
      userQuizAnswer.userOptionId,
      userQuizAnswer.isUserAnswerCorrect ? this.dbType(1) : this.dbType(0),
      userQuizAnswer.canRepeat ? this.dbType(1) : this.dbType(0),
      userQuizAnswer.createdAt.value.toISOString(),
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
    const queryParts = [`SELECT * FROM quizzes WHERE ${this.dbType(1)}`]
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
        const quizState = this.convertDatabaseQuestion(quizFromDB, [], user, discipline)
        return Quiz.toDomain(quizState)
      })
    )
  }

  async getById(quizId: string): Promise<Quiz | null> {
    const query = "SELECT * FROM quizzes WHERE quiz_id = ?"
    const quizFromDB = await this.connection.get<QuizRow>(query, [quizId])
    if (!quizFromDB) return null
    const user = await this.userRepository.getById(quizFromDB.user_id)
    const discipline = await this.disciplineRepository.getById(quizFromDB.discipline_id)
    const answers = await this.getAnswers(quizId)
    const quizState = this.convertDatabaseQuestion(quizFromDB, answers, user, discipline)
    return Quiz.toDomain(quizState)
  }

  async resetCanRepeat(userId: string, topicId: string): Promise<void> {
    const query = `UPDATE quiz_answers SET can_repeat = ${this.dbType(
      1
    )} WHERE quiz_id IN (SELECT quiz_id FROM quizzes WHERE user_id = ?) AND question_id IN (SELECT question_id FROM questions WHERE topic_id = ?)`
    return this.connection.run(query, [userId, topicId])
  }

  private async getAnswers(quizId: string): Promise<QuizAnswer[]> {
    const query = "SELECT * FROM quiz_answers WHERE quiz_id = ?"
    const answersFromDB = await this.connection.all<QuizAnswerRow>(query, [quizId])
    return answersFromDB.map((answer) =>
      QuizAnswer.toDomain({
        quizAnswerId: answer.quiz_answer_id,
        quizId: answer.quiz_id,
        questionId: answer.question_id,
        topicId: answer.topic_id,
        correctOptionId: answer.correct_option_id,
        userOptionId: answer.user_option_id,
        isUserAnswerCorrect: !!answer.is_user_answer_correct,
        canRepeat: !!answer.can_repeat,
        createdAt: DateBr.create(answer.created_at).value,
      })
    )
  }

  private convertDatabaseQuestion(quiz: QuizRow, answers: QuizAnswer[], user: User, discipline: Discipline): QuizState {
    return {
      quizId: quiz.quiz_id,
      quizType: QuizType.create(quiz.quiz_type),
      user,
      discipline,
      topicsRootId: JSON.parse(quiz.topics_id),
      answers: answers.map((answer) => QuizAnswer.create(answer)),
      isActive: !!quiz.is_active,
      createdAt: DateBr.create(quiz.created_at).value,
      updatedAt: quiz.updated_at ? DateBr.create(quiz.updated_at).value : null,
    }
  }

  private dbType(value: number): boolean | number {
    return this.connection.databaseType() === "postgres" ? Boolean(value) : value
  }
}
