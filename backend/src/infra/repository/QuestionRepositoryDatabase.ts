import { QuestionOptionDTO } from "@simulex/models"
import {
  QuestionRepository,
  QuestionDisciplineStatistics,
  TopicStatistics,
} from "../../application/repository/QuestionRepository"
import { Question, QuestionOption } from "../../domain/entity"
import { DateBr } from "../../shared/domain/valueObject/DateBr"
import { QuestionOptionState, QuestionState } from "../../shared/models"
import { DatabaseConnection } from "../database"

interface RawQuestionData {
  question_id: string
  topic_id: string
  prompt: string
  options: string
  is_multiple_choice: number | boolean
  difficulty: number
  qty_correct_answers: number
  qty_answered: number
  difficulty_recursive: number
  simulex_hash: string
  topic_root_id: string
  linked_topics: string
  year: number
  source_id: string
  is_active: number | boolean
  created_by: string
  created_at: string
}

export class QuestionRepositoryDatabase implements QuestionRepository {
  constructor(private readonly connection: DatabaseConnection) {}
  migrateOptions(): Promise<{ updatedCount: number; deactivatedCount: number }> {
    throw new Error("Method not implemented.")
  }

  private prepareQuestionParams(question: Question): (string | number | boolean)[] {
    return [
      question.topicId,
      question.prompt,
      JSON.stringify(question.options.toDTO()),
      question.isMultipleChoice ? this.dbType(1) : this.dbType(0),
      question.difficulty,
      question.qtyCorrectAnswers,
      question.qtyAnswered,
      question.difficultyRecursive,
      question.simulexHash,
      question.topicRootId,
      JSON.stringify(question.linkedTopics),
      question.year,
      question.sourceId,
      question.isActive ? this.dbType(1) : this.dbType(0),
      question.createdBy,
      question.createdAt ? question.createdAt.value.toISOString() : DateBr.create().value.toISOString(),
    ]
  }

  private async updateQuestion(question: Question): Promise<void> {
    const query = `
      UPDATE questions SET
        topic_id = ?,
        prompt = ?,
        options = ?,
        is_multiple_choice = ?,
        difficulty = ?,
        qty_correct_answers = ?,
        qty_answered = ?,
        difficulty_recursive = ?,
        simulex_hash = ?,
        topic_root_id = ?,
        linked_topics = ?,
        year = ?,
        source_id = ?,
        is_active = ?,
        created_by = ?,
        created_at = ?
      WHERE question_id = ?
    `
    const params = [...this.prepareQuestionParams(question), question.questionId]
    await this.connection.run(query, params)
  }

  private async insertQuestion(question: Question): Promise<void> {
    const query = `
      INSERT INTO questions (
        question_id,
        topic_id,
        prompt,
        options,
        is_multiple_choice,
        difficulty,
        qty_correct_answers,
        qty_answered,
        difficulty_recursive,
        simulex_hash,
        topic_root_id,
        linked_topics,
        year,
        source_id,
        is_active,
        created_by,
        created_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `
    const params = [question.questionId, ...this.prepareQuestionParams(question)]
    await this.connection.run(query, params)
  }

  async save(question: Question): Promise<void> {
    const existingQuestion = await this.getById(question.questionId)
    if (existingQuestion) {
      await this.updateQuestion(question)
    } else {
      await this.insertQuestion(question)
    }
  }

  async getById(questionId: string): Promise<Question | null> {
    if (!questionId) return null
    const query = "SELECT * FROM questions WHERE question_id = ?"
    const rawQuestionData = await this.connection.get<RawQuestionData>(query, [questionId])
    return rawQuestionData ? Question.toDomain(this.convertDatabaseQuestion(rawQuestionData)) : null
  }

  async getAll(
    { topicId, showAll }: { topicId?: string; showAll?: boolean } = {
      topicId: null,
      showAll: false,
    }
  ): Promise<Question[]> {
    const queryParts = [`SELECT * FROM questions WHERE ${this.dbType(1)}`]
    if (!showAll) queryParts.push(`AND is_active = ${this.dbType(1)}`)
    if (topicId) queryParts.push(`AND topic_id = '${topicId}'`)
    queryParts.push("ORDER BY created_at DESC LIMIT 100")

    const query = queryParts.join(" ")
    const rawQuestionsData = await this.connection.all<RawQuestionData>(query)
    return rawQuestionsData.map((question: RawQuestionData) => {
      return Question.toDomain(this.convertDatabaseQuestion(question))
    })
  }

  async getRandom({
    topicId,
    userId,
    topicsRoot,
  }: {
    topicId: string
    userId: string
    topicsRoot: string[]
  }): Promise<Question | null> {
    const topicsRootParam = topicsRoot.map(() => "?").join(", ")
    const query = `
      SELECT q.*
      FROM questions q
      JOIN topics t ON q.topic_id = t.topic_id
      WHERE t.topic_id = ?
      AND q.is_active = ${this.dbType(1)}
      AND question_id NOT IN (
        SELECT qa.question_id
        FROM quiz_answers qa
        JOIN quizzes qz ON qa.quiz_id = qz.quiz_id
        JOIN questions q ON qa.question_id = q.question_id
        WHERE q.topic_id = ? AND qz.user_id = ? AND qa.can_repeat = ${this.dbType(0)}
      )
      AND t.topic_root_id IN (${topicsRootParam})
      ORDER BY RANDOM()
      LIMIT 1
    `
    const params = [topicId, topicId, userId, ...topicsRoot]
    const question = await this.connection.get<RawQuestionData>(query, params)

    if (!question) {
      return null
    }

    return Question.toDomain(this.convertDatabaseQuestion(question))
  }

  async getByHash(simulexHash: string): Promise<Question | null> {
    if (!simulexHash) return null
    const query = "SELECT * FROM questions WHERE simulex_hash = ?"
    const rawQuestionData = await this.connection.get<RawQuestionData>(query, [simulexHash])
    return rawQuestionData ? Question.toDomain(this.convertDatabaseQuestion(rawQuestionData)) : null
  }

  // retorna o total de questões ativas de cada tópico da disciplina
  async getDisciplineStatistics(disciplineId: string): Promise<QuestionDisciplineStatistics> {
    const query = `
    SELECT
      q.topic_id,
      COUNT(q.question_id) as qty_questions
    FROM questions q
    JOIN topics t ON q.topic_id = t.topic_id
    WHERE t.discipline_id = ? AND q.is_active = ${this.dbType(1)}
    GROUP BY q.topic_id
  `
    const result = await this.connection.all(query, [disciplineId])
    const topicStatistics: TopicStatistics[] = []
    result.forEach((topic: { topic_id: string; qty_questions: number }) => {
      topicStatistics.push({
        topicId: topic.topic_id,
        qtyQuestions: Number(topic.qty_questions),
      })
    })
    const questionStatistics: QuestionDisciplineStatistics = {
      disciplineId: disciplineId,
      topics: topicStatistics,
    }
    return questionStatistics
  }

  private convertDatabaseQuestion(question: RawQuestionData): QuestionState {
    const rawOptionsList: QuestionOptionState[] = JSON.parse(question.options)
    const questionOptionsDTO: QuestionOption[] = rawOptionsList.map((questionOptionState: QuestionOptionState) =>
      QuestionOption.toDomain({
        optionId: questionOptionState.optionId,
        text: questionOptionState.text,
        isCorrectAnswer: questionOptionState.isCorrectAnswer,
        questionId: questionOptionState.questionId,
        item: questionOptionState.item,
        obs: questionOptionState.obs,
      })
    )
    return {
      questionId: question.question_id,
      topicId: question.topic_id,
      prompt: question.prompt,
      isMultipleChoice: question.is_multiple_choice === this.dbType(1),
      options: questionOptionsDTO,
      difficulty: Number(question.difficulty),
      qtyAnswered: Number(question.qty_answered),
      qtyCorrectAnswers: Number(question.qty_correct_answers),
      difficultyRecursive: Number(question.difficulty_recursive),
      simulexHash: question.simulex_hash,
      topicRootId: question.topic_root_id,
      linkedTopics: JSON.parse(question.linked_topics),
      year: question.year.toString(),
      sourceId: question.source_id,
      isActive: question.is_active === this.dbType(1),
      createdBy: question.created_by,
      createdAt: DateBr.create(question.created_at).value,
    }
  }

  private dbType(value: number): boolean | number {
    return this.connection.databaseType() === "postgres" ? Boolean(value) : value
  }
}
