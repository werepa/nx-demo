import { DatabaseConnection, DatabaseType, QueryResult, SqlParameter } from "./DatabaseConnection"
import { Logger } from "../../shared/utils/Logger"
import { SqliteInMemory } from "../repository/inMemory"

export class InMemoryAdapter implements DatabaseConnection {
  private connection: SqliteInMemory
  private logger: Logger
  private isOpen = false

  constructor() {
    this.connection = new SqliteInMemory()
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
      const stmt = this.connection.db.prepare(statement)
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
      const stmt = this.connection.db.prepare(statement)
      const result = params ? stmt.get(...params) : stmt.get()
      return result as T | undefined
    } catch (error) {
      this.handleError(error)
    }
  }

  async all<T>(statement: string, params?: SqlParameter[]): Promise<T[]> {
    try {
      this.checkConnection()
      const stmt = this.connection.db.prepare(statement)
      const results = params ? stmt.all(...params) : stmt.all()
      return results as T[]
    } catch (error) {
      this.handleError(error)
    }
  }

  async query<T>(statement: string, params?: SqlParameter[]): Promise<QueryResult<T>> {
    try {
      this.checkConnection()
      const stmt = this.connection.db.prepare(statement)
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
      const stmt = this.connection.db.prepare(statement)
      const result = params ? stmt.get(...params) : stmt.get()
      return result as T | undefined
    } catch (error) {
      this.handleError(error)
    }
  }

  async none(statement: string, params?: SqlParameter[]): Promise<void> {
    try {
      this.checkConnection()
      const stmt = this.connection.db.prepare(statement)
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
        this.connection.db.close()
        this.isOpen = false
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  databaseType(): DatabaseType {
    return "sqlite"
  }

  async clear(tables: string[]): Promise<void> {
    if (process.env["NODE_ENV"] === "production") return

    try {
      this.checkConnection()
      tables.forEach((table) => {
        const stmt = this.connection.db.prepare(`DELETE FROM ${table}`)
        stmt.run()
      })
    } catch (error) {
      this.handleError(error)
    }
  }
}
