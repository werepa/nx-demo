import { DatabaseConnection, DatabaseType, QueryResult, SqlParameter } from "./DatabaseConnection"
import Database from "better-sqlite3"
import { Logger } from "../../shared/utils/Logger"

export class InMemoryAdapter implements DatabaseConnection {
  private connection: Database.Database
  private logger: Logger

  constructor() {
    this.connection = new Database(":memory:")
    this.logger = new Logger()
  }

  databaseType(): DatabaseType {
    return "sqlite"
  }

  async run(statement: string, params?: SqlParameter[]): Promise<void> {
    try {
      this.connection.exec(statement)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  async get<T>(statement: string, params?: SqlParameter[]): Promise<T> {
    try {
      return this.connection.prepare(statement).get(params) as T
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  async all<T>(statement: string, params?: SqlParameter[]): Promise<T[]> {
    try {
      return this.connection.prepare(statement).all(params) as T[]
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  async close(): Promise<void> {
    try {
      this.connection.close()
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  async query<T>(query: string): Promise<QueryResult<T>> {
    try {
      const rows = this.connection.prepare(query).all() as T[]
      return {
        rows,
        rowCount: rows.length,
      }
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  async one<T>(query: string): Promise<T> {
    try {
      return this.connection.prepare(query).get() as T
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  async none(query: string): Promise<void> {
    try {
      this.connection.prepare(query).run()
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}
