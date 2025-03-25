import BetterSqlite3 from "better-sqlite3"

export class SqliteInMemory {
  public db: BetterSqlite3.Database

  constructor() {
    this.initialize()
  }

  private async initialize() {
    this.db = new BetterSqlite3(":memory:")
    this.db.pragma("journal_mode = WAL")
    this.db.pragma("synchronous = normal")

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT NOT NULL,
        name TEXT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        image TEXT DEFAULT NULL,
        is_active INTEGER NOT NULL,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        PRIMARY KEY (user_id)
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS disciplines (
        discipline_id TEXT NOT NULL,
        name TEXT NOT NULL,
        image TEXT DEFAULT NULL,
        is_active INTEGER NOT NULL,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        PRIMARY KEY (discipline_id)
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS topics (
        topic_id TEXT NOT NULL,
        topic_root_id TEXT NOT NULL,
        discipline_id TEXT NOT NULL,
        name TEXT NOT NULL,
        parent_id TEXT DEFAULT NULL,
        is_classify INTEGER NOT NULL,
        dependencies TEXT NOT NULL,
        obs TEXT DEFAULT NULL,
        is_active INTEGER NOT NULL,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        PRIMARY KEY (topic_id),
        FOREIGN KEY (discipline_id) REFERENCES disciplines(discipline_id)
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        question_id TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        prompt TEXT NOT NULL,
        options TEXT NOT NULL,
        is_multiple_choice INTEGER NOT NULL,
        difficulty REAL NOT NULL,
        qty_correct_answers INTEGER NOT NULL,
        qty_answered INTEGER NOT NULL,
        difficulty_recursive REAL NOT NULL,
        simulex_hash TEXT NOT NULL,
        topic_root_id TEXT NOT NULL,
        linked_topics TEXT NOT NULL,
        year TEXT NOT NULL,
        source_id TEXT NULL,
        is_active INTEGER NOT NULL,
        created_by TEXT NULL,
        created_at TIMESTAMP,
        PRIMARY KEY (question_id),
        FOREIGN KEY (topic_id) REFERENCES topics(topic_id)
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS quizzes (
        quiz_id TEXT NOT NULL,
        quiz_type TEXT NOT NULL,
        user_id TEXT NOT NULL,
        discipline_id TEXT NOT NULL,
        topics_id TEXT NOT NULL,
        is_active INTEGER NOT NULL,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        PRIMARY KEY (quiz_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (discipline_id) REFERENCES disciplines(discipline_id)
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        quiz_answer_id TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        correct_option_id TEXT NULL,
        user_option_id TEXT NULL,
        is_user_answer_correct INTEGER NOT NULL,
        can_repeat INTEGER NOT NULL,
        created_at TIMESTAMP,
        PRIMARY KEY (quiz_answer_id),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id),
        FOREIGN KEY (question_id) REFERENCES questions(question_id),
        FOREIGN KEY (topic_id) REFERENCES topics(topic_id)
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_topic_learnings (
        user_topic_learning_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        avg_grade REAL NULL,
        level_in_topic REAL NOT NULL,
        qty_questions_answered INTEGER NOT NULL,
        PRIMARY KEY (user_topic_learning_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (topic_id) REFERENCES topics(topic_id)
      )
    `)
  }
}
