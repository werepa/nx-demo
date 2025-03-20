import pgPromise from "pg-promise"
import { DatabaseConnection, DatabaseType, QueryResult } from "./DatabaseConnection"

export class PgPromiseAdapter implements DatabaseConnection {
  private connection: pgPromise.IDatabase<{}>

  constructor() {
    const pgp = pgPromise()
    this.connection = pgp(process.env.DATABASE_URL || "")
  }

  databaseType(): DatabaseType {
    return "postgres"
  }

  async run(statement: string, params?: any[]): Promise<void> {
    await this.connection.none(statement, params)
  }

  async get<T>(statement: string, params?: any[]): Promise<T> {
    return this.connection.one(statement, params)
  }

  async all<T>(statement: string, params?: any[]): Promise<T[]> {
    return this.connection.any(statement, params)
  }

  async close(): Promise<void> {
    await this.connection.$pool.end()
  }

  async query<T>(query: string): Promise<QueryResult<T>> {
    const result = await this.connection.query(query)
    return {
      rows: result,
      rowCount: result.length,
    }
  }

  async one<T>(query: string): Promise<T> {
    return this.connection.one(query)
  }

  async none(query: string): Promise<void> {
    await this.connection.none(query)
  }
}
