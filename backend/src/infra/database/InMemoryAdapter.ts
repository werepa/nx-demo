import { DatabaseConnection, DatabaseType, QueryResult, SqlParameter } from "./DatabaseConnection"
import BetterSqlite3 from "better-sqlite3"
import { Logger } from "../../shared/utils/Logger"

export class InMemoryAdapter implements DatabaseConnection {
  private connection: BetterSqlite3.Database
  private logger: Logger
  private isOpen = false

  constructor() {
    this.connection = new BetterSqlite3(":memory:")
    this.logger = new Logger()
    this.isOpen = true
  }

  private checkConnection() {
    if (!this.isOpen) {
      throw new Error("Database connection is not open")
    }
  }

  private handleError(error: unknown): never {
    this.logger.error(error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Unknown database error occurred")
  }

  async run(statement: string, params?: SqlParameter[]): Promise<void> {
    try {
      this.checkConnection()
      const stmt = this.connection.prepare(statement)
      if (params) {
        stmt.run(...params)
      } else {
        stmt.run()
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async get<T>(statement: string, params?: SqlParameter[]): Promise<T | undefined> {
    try {
      this.checkConnection()
      const stmt = this.connection.prepare(statement)
      const result = params ? stmt.get(...params) : stmt.get()
      return result as T | undefined
    } catch (error) {
      this.handleError(error)
    }
  }

  async all<T>(statement: string, params?: SqlParameter[]): Promise<T[]> {
    try {
      this.checkConnection()
      const stmt = this.connection.prepare(statement)
      const results = params ? stmt.all(...params) : stmt.all()
      return results as T[]
    } catch (error) {
      this.handleError(error)
    }
  }

  async query<T>(statement: string, params?: SqlParameter[]): Promise<QueryResult<T>> {
    try {
      this.checkConnection()
      const stmt = this.connection.prepare(statement)
      const rows = params ? stmt.all(...params) : stmt.all()
      return {
        rows: rows as T[],
        rowCount: rows.length,
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async one<T>(statement: string, params?: SqlParameter[]): Promise<T | undefined> {
    try {
      this.checkConnection()
      const stmt = this.connection.prepare(statement)
      const result = params ? stmt.get(...params) : stmt.get()
      return result as T | undefined
    } catch (error) {
      this.handleError(error)
    }
  }

  async none(statement: string, params?: SqlParameter[]): Promise<void> {
    try {
      this.checkConnection()
      const stmt = this.connection.prepare(statement)
      if (params) {
        stmt.run(...params)
      } else {
        stmt.run()
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async close(): Promise<void> {
    try {
      if (this.isOpen) {
        this.connection.close()
        this.isOpen = false
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  databaseType(): DatabaseType {
    return "sqlite"
  }
}
