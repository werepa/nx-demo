import pgPromise from "pg-promise"
import { DatabaseConnection, DatabaseType, QueryResult, SqlParameter } from "./DatabaseConnection"
import { Logger } from "../../shared/utils/Logger"

export class PgPromiseAdapter implements DatabaseConnection {
  private connection: pgPromise.IDatabase<object>
  private logger: Logger

  constructor(connectionUrl?: string) {
    try {
      const pgp = pgPromise()
      let dbUrl = connectionUrl || process.env.DATABASE_URL
      dbUrl = process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE_URL : dbUrl
      if (!dbUrl) {
        throw new Error("No database connection URL provided")
      }
      this.connection = pgp(dbUrl)
      this.logger = new Logger()
    } catch (error) {
      this.logger = new Logger()
      this.logger.error("Failed to initialize PostgreSQL database:" + error)
      throw error
    }
  }
  F
  databaseType(): DatabaseType {
    return "postgres"
  }

  async run(statement: string, params?: SqlParameter[]): Promise<void> {
    try {
      await this.connection.none(statement, params || [])
    } catch (error) {
      this.logger.error(`Error executing statement: ${statement}`)
      this.logger.error(`Parameters: ${JSON.stringify(params)}`)
      this.logger.error(error)
      throw error
    }
  }

  async get<T>(statement: string, params?: SqlParameter[]): Promise<T> {
    try {
      return await this.connection.one(statement, params || [])
    } catch (error) {
      this.logger.error(`Error executing statement: ${statement}`)
      this.logger.error(`Parameters: ${JSON.stringify(params)}`)
      this.logger.error(error)
      throw error
    }
  }

  async all<T>(statement: string, params?: SqlParameter[]): Promise<T[]> {
    try {
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
      await this.connection.$pool.end()
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  async query<T>(query: string, params?: SqlParameter[]): Promise<QueryResult<T>> {
    try {
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

  async one<T>(query: string, params?: SqlParameter[]): Promise<T> {
    try {
      return await this.connection.one(query, params || [])
    } catch (error) {
      this.logger.error(`Error executing query: ${query}`)
      this.logger.error(`Parameters: ${JSON.stringify(params)}`)
      this.logger.error(error)
      throw error
    }
  }

  async none(query: string, params?: SqlParameter[]): Promise<void> {
    try {
      await this.connection.none(query, params || [])
    } catch (error) {
      this.logger.error(`Error executing query: ${query}`)
      this.logger.error(`Parameters: ${JSON.stringify(params)}`)
      this.logger.error(error)
      throw error
    }
  }
}
