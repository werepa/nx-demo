import Database from "better-sqlite3"

export class SqliteInMemory {
  public db: any

  constructor() {
    this.initialize()
  }

  private async initialize() {
    this.db = new Database(":memory:")
    this.db.pragma("journal_mode = WAL")
    this.db.pragma("synchronous = normal")

    this.db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      user_id TEXT NOT NULL,
      name TEXT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      image TEXT DEFAULT NULL,
      is_active BOOLEAN NOT NULL,
      created_at TIMESTAMP,
      updated_at TIMESTAMP,
      PRIMARY KEY (user_id)
    )
  `)

    this.db.exec(`
    CREATE TABLE IF NOT EXISTS user_topic_learning (
      user_topic_learning_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      avg_grade TEXT NULL,
      level_in_topic TEXT NOT NULL,
      qty_questions_answered INTEGER NOT NULL,
      PRIMARY KEY (user_topic_learning_id)
    )
  `)

    this.db.exec(`
	  CREATE TABLE IF NOT EXISTS discipline (
		discipline_id TEXT NOT NULL,
		name TEXT NOT NULL,
		image TEXT DEFAULT NULL,
		is_active BOOLEAN NOT NULL,
		created_at TIMESTAMP,
		updated_at TIMESTAMP,
		PRIMARY KEY (discipline_id)
	  )
	`)

    this.db.exec(`
    CREATE TABLE IF NOT EXISTS topic (
      topic_id TEXT NOT NULL,
      topic_root_id TEXT NOT NULL,
      discipline_id TEXT NOT NULL,
      name TEXT NOT NULL,
      parent_id TEXT DEFAULT NULL,
      is_classify BOOLEAN NOT NULL,
      dependencies TEXT NOT NULL,
      obs TEXT DEFAULT NULL,
      is_active BOOLEAN NOT NULL,
      created_at TIMESTAMP,
      updated_at TIMESTAMP,
      PRIMARY KEY (topic_id)
    )
  `)

    this.db.exec(`
    CREATE TABLE IF NOT EXISTS question (
      question_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      prompt TEXT NOT NULL,
      options TEXT NOT NULL,
      is_multiple_choice BOOLEAN NOT NULL,
      difficulty TEXT NOT NULL,
      qty_correct_answers INTEGER NOT NULL,
      qty_answered INTEGER NOT NULL,
      difficulty_recursive TEXT NOT NULL,
      simulex_hash TEXT NOT NULL,
      topic_root_id TEXT NOT NULL,
      linked_topics TEXT NOT NULL,
      year TEXT NOT NULL,
      source_id TEXT NULL,
      is_active BOOLEAN NOT NULL,
      created_by TEXT NULL,
      created_at TIMESTAMP,
      PRIMARY KEY (question_id)
    )
  `)

    this.db.exec(`
    CREATE TABLE IF NOT EXISTS quiz (
      quiz_id TEXT NOT NULL,
      quiz_type TEXT NOT NULL,
      user_id TEXT NOT NULL,
      discipline_id TEXT NOT NULL,
      topics_id TEXT NOT NULL,
      is_active BOOLEAN NOT NULL,
      created_at TIMESTAMP,
      updated_at TIMESTAMP,
      PRIMARY KEY (quiz_id)
    )
  `)

    this.db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_answer (
      quiz_answer_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      correct_option_id TEXT NULL,
      user_option_id TEXT NULL,
      is_user_answer_correct BOOLEAN NOT NULL,
      can_repeat BOOLEAN NOT NULL,
      created_at TIMESTAMP,
      PRIMARY KEY (quiz_answer_id)
    )
  `)
  }
}
