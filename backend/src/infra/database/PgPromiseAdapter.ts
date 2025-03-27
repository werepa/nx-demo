import pgPromise from "pg-promise"
import { DatabaseConnection, DatabaseType, QueryResult, SqlParameter } from "./DatabaseConnection"
import { Logger } from "../../shared/utils/Logger"

export class PgPromiseAdapter implements DatabaseConnection {
  private connection: pgPromise.IDatabase<object>
  private readonly logger: Logger
  private isOpen = true

  constructor(connectionUrl?: string) {
    this.logger = new Logger()
    try {
      const pgp = pgPromise()
      const dbUrl = this.getConnectionUrl(connectionUrl)
      if (!dbUrl) {
        throw new Error("No database connection URL provided")
      }
      this.connection = pgp(dbUrl)
    } catch (error) {
      this.logger.error("Failed to initialize PostgreSQL database:" + error)
      throw error
    }
  }

  private getConnectionUrl(connectionUrl?: string): string {
    const dbUrl = connectionUrl || process.env.DATABASE_URL
    return process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE_URL : dbUrl
  }

  private checkConnection() {
    if (!this.isOpen) {
      throw new Error("Database connection is not open")
    }
  }

  databaseType(): DatabaseType {
    return "postgres"
  }

  async run(statement: string, params?: SqlParameter[]): Promise<void> {
    try {
      this.checkConnection()
      await this.connection.none(statement, params || [])
    } catch (error) {
      this.logger.error(`Error executing statement: ${statement}`)
      this.logger.error(`Parameters: ${JSON.stringify(params)}`)
      this.logger.error(error)
      throw error
    }
  }

  async get<T>(statement: string, params?: SqlParameter[]): Promise<T | undefined> {
    try {
      this.checkConnection()
      return await this.connection.oneOrNone(statement, params || [])
    } catch (error) {
      this.logger.error(`Error executing statement: ${statement}`)
      this.logger.error(`Parameters: ${JSON.stringify(params)}`)
      this.logger.error(error)
      throw error
    }
  }

  async all<T>(statement: string, params?: SqlParameter[]): Promise<T[]> {
    try {
      this.checkConnection()
      return await this.connection.any(statement, params || [])
    } catch (error) {
      this.logger.error(`Error executing statement: ${statement}`)
      this.logger.error(`Parameters: ${JSON.stringify(params)}`)
      this.logger.error(error)
      throw error
    }
  }

  async close(): Promise<void> {
    try {
      if (this.isOpen) {
        await this.connection.$pool.end()
        this.isOpen = false
      }
    } catch (error) {
      this.logger.error("Error closing database connection")
      this.logger.error(error)
      throw error
    }
  }

  async query<T>(query: string, params?: SqlParameter[]): Promise<QueryResult<T>> {
    try {
      this.checkConnection()
      const result = await this.connection.query(query, params || [])
      return {
        rows: result,
        rowCount: result.length,
      }
    } catch (error) {
      this.logger.error(`Error executing query: ${query}`)
      this.logger.error(`Parameters: ${JSON.stringify(params)}`)
      this.logger.error(error)
      throw error
    }
  }

  async one<T>(query: string, params?: SqlParameter[]): Promise<T | undefined> {
    try {
      this.checkConnection()
      return await this.connection.oneOrNone(query, params || [])
    } catch (error) {
      this.logger.error(`Error executing query: ${query}`)
      this.logger.error(`Parameters: ${JSON.stringify(params)}`)
      this.logger.error(error)
      throw error
    }
  }

  async none(query: string, params?: SqlParameter[]): Promise<void> {
    try {
      this.checkConnection()
      await this.connection.none(query, params || [])
    } catch (error) {
      this.logger.error(`Error executing query: ${query}`)
      this.logger.error(`Parameters: ${JSON.stringify(params)}`)
      this.logger.error(error)
      throw error
    }
  }
}
