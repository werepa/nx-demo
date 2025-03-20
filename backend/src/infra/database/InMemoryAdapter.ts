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
      const stmt = this.connection.prepare(statement)
      if (params) {
        stmt.run(...params)
      } else {
        stmt.run()
      }
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  async get<T>(statement: string, params?: SqlParameter[]): Promise<T> {
    try {
      const stmt = this.connection.prepare(statement)
      return params ? (stmt.get(...params) as T) : (stmt.get() as T)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  async all<T>(statement: string, params?: SqlParameter[]): Promise<T[]> {
    try {
      const stmt = this.connection.prepare(statement)
      return params ? (stmt.all(...params) as T[]) : (stmt.all() as T[])
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

  async none(query: string, params?: SqlParameter[]): Promise<void> {
    try {
      const stmt = this.connection.prepare(query)
      if (params) {
        stmt.run(...params)
      } else {
        stmt.run()
      }
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}
