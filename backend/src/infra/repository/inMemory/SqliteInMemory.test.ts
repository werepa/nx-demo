import { SqliteInMemory } from "./SqliteInMemory"
import BetterSqlite3 from "better-sqlite3"

describe("SqliteInMemory", () => {
  let sqliteInMemory: SqliteInMemory

  beforeAll(() => {
    sqliteInMemory = new SqliteInMemory()
  })

  afterAll(() => {
    sqliteInMemory.db.close()
  })

  test("should create an in-memory SQLite database", () => {
    expect(sqliteInMemory.db instanceof BetterSqlite3).toBe(true)
  })

  test("should create all required tables", () => {
    // Get list of tables
    const result = sqliteInMemory.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{
      name: string
    }>
    const tables = result.map((table) => table.name)

    // Verify all required tables exist
    expect(tables).toContain("users")
    expect(tables).toContain("disciplines")
    expect(tables).toContain("topics")
    expect(tables).toContain("questions")
    expect(tables).toContain("quizzes")
    expect(tables).toContain("quiz_answers")
    expect(tables).toContain("user_topic_learnings")
  })

  test("should have correct schema for users table", () => {
    const tableInfo = sqliteInMemory.db.prepare("PRAGMA table_info(users)").all()

    expect(tableInfo).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "user_id", type: "TEXT", notnull: 1, pk: 1 }),
        expect.objectContaining({ name: "name", type: "TEXT", notnull: 0 }),
        expect.objectContaining({ name: "email", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "password", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "role", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "image", type: "TEXT" }),
        expect.objectContaining({ name: "is_active", type: "INTEGER", notnull: 1 }),
        expect.objectContaining({ name: "created_at", type: "TIMESTAMP" }),
        expect.objectContaining({ name: "updated_at", type: "TIMESTAMP" }),
      ])
    )
  })

  test("should have correct schema for disciplines table", () => {
    const tableInfo = sqliteInMemory.db.prepare("PRAGMA table_info(disciplines)").all()

    expect(tableInfo).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "discipline_id", type: "TEXT", notnull: 1, pk: 1 }),
        expect.objectContaining({ name: "name", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "image", type: "TEXT" }),
        expect.objectContaining({ name: "is_active", type: "INTEGER", notnull: 1 }),
        expect.objectContaining({ name: "created_at", type: "TIMESTAMP" }),
        expect.objectContaining({ name: "updated_at", type: "TIMESTAMP" }),
      ])
    )
  })

  test("should have correct schema for topics table", () => {
    const tableInfo = sqliteInMemory.db.prepare("PRAGMA table_info(topics)").all()

    expect(tableInfo).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "topic_id", type: "TEXT", notnull: 1, pk: 1 }),
        expect.objectContaining({ name: "topic_root_id", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "discipline_id", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "name", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "parent_id", type: "TEXT" }),
        expect.objectContaining({ name: "is_classify", type: "INTEGER", notnull: 1 }),
        expect.objectContaining({ name: "dependencies", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "obs", type: "TEXT" }),
        expect.objectContaining({ name: "is_active", type: "INTEGER", notnull: 1 }),
        expect.objectContaining({ name: "created_at", type: "TIMESTAMP" }),
        expect.objectContaining({ name: "updated_at", type: "TIMESTAMP" }),
      ])
    )
  })

  test("should have correct schema for questions table", () => {
    const tableInfo = sqliteInMemory.db.prepare("PRAGMA table_info(questions)").all()

    expect(tableInfo).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "question_id", type: "TEXT", notnull: 1, pk: 1 }),
        expect.objectContaining({ name: "topic_id", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "prompt", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "options", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "is_multiple_choice", type: "INTEGER", notnull: 1 }),
        expect.objectContaining({ name: "difficulty", type: "REAL", notnull: 1 }),
        expect.objectContaining({ name: "qty_correct_answers", type: "INTEGER", notnull: 1 }),
        expect.objectContaining({ name: "qty_answered", type: "INTEGER", notnull: 1 }),
        expect.objectContaining({ name: "difficulty_recursive", type: "REAL", notnull: 1 }),
        expect.objectContaining({ name: "simulex_hash", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "topic_root_id", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "linked_topics", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "year", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "source_id", type: "TEXT" }),
        expect.objectContaining({ name: "is_active", type: "INTEGER", notnull: 1 }),
        expect.objectContaining({ name: "created_by", type: "TEXT" }),
        expect.objectContaining({ name: "created_at", type: "TIMESTAMP" }),
      ])
    )
  })

  test("should have correct schema for quizzes table", () => {
    const tableInfo = sqliteInMemory.db.prepare("PRAGMA table_info(quizzes)").all()

    expect(tableInfo).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "quiz_id", type: "TEXT", notnull: 1, pk: 1 }),
        expect.objectContaining({ name: "quiz_type", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "user_id", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "discipline_id", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "topics_id", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "is_active", type: "INTEGER", notnull: 1 }),
        expect.objectContaining({ name: "created_at", type: "TIMESTAMP" }),
        expect.objectContaining({ name: "updated_at", type: "TIMESTAMP" }),
      ])
    )
  })

  test("should have correct schema for quiz_answers table", () => {
    const tableInfo = sqliteInMemory.db.prepare("PRAGMA table_info(quiz_answers)").all()

    expect(tableInfo).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "quiz_answer_id", type: "TEXT", notnull: 1, pk: 1 }),
        expect.objectContaining({ name: "quiz_id", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "question_id", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "topic_id", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "correct_option_id", type: "TEXT" }),
        expect.objectContaining({ name: "user_option_id", type: "TEXT" }),
        expect.objectContaining({ name: "is_user_answer_correct", type: "INTEGER", notnull: 1 }),
        expect.objectContaining({ name: "can_repeat", type: "INTEGER", notnull: 1 }),
        expect.objectContaining({ name: "created_at", type: "TIMESTAMP" }),
      ])
    )
  })

  test("should have correct schema for user_topic_learnings table", () => {
    const tableInfo = sqliteInMemory.db.prepare("PRAGMA table_info(user_topic_learnings)").all()

    expect(tableInfo).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "user_topic_learning_id", type: "TEXT", notnull: 1, pk: 1 }),
        expect.objectContaining({ name: "user_id", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "topic_id", type: "TEXT", notnull: 1 }),
        expect.objectContaining({ name: "score", type: "INTEGER", notnull: 1 }),
        expect.objectContaining({ name: "avg_grade", type: "REAL" }),
        expect.objectContaining({ name: "level_in_topic", type: "REAL", notnull: 1 }),
        expect.objectContaining({ name: "qty_questions_answered", type: "INTEGER", notnull: 1 }),
      ])
    )
  })

  test("should enforce foreign key constraints", () => {
    const foreignKeysEnabled = sqliteInMemory.db.prepare("PRAGMA foreign_keys").get() as { foreign_keys: number }

    expect(foreignKeysEnabled.foreign_keys).toBe(1)
  })
})
