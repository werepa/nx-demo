import pgPromise from "pg-promise"
import { DatabaseConnection, DatabaseType, SqlParameter } from "./DatabaseConnection"
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

  private handleError(error: unknown): never {
    this.logger.error(error)

    if (error instanceof Error) {
      throw error
    }
    throw new Error("Unknown database error occurred")
  }

  async run(statement: string, params?: SqlParameter[]): Promise<void> {
    await this.all(statement, params)
  }

  async get<T>(statement: string, params?: SqlParameter[]): Promise<T | null> {
    const result = await this.all<T>(statement, params)
    return result.length > 0 ? result[0] : null
  }

  async all<T>(statement: string, params?: SqlParameter[]): Promise<T[]> {
    try {
      this.checkConnection()
      statement = this.transformQuery(statement)
      return this.connection.tx(async (transaction: pgPromise.ITask<object>) => {
        const result = params ? await transaction.query(statement, params) : await transaction.query(statement)
        return result as T[]
      })
    } catch (error) {
      error.statement = `Error executing statement: ${statement}`
      error.params = `Parameters: ${JSON.stringify(params)}`
      this.handleError(error)
    }
  }

  async close(): Promise<void> {
    try {
      if (this.isOpen) {
        await this.connection.$pool.end()
        this.isOpen = false
      }
    } catch (error) {
      error.statement = "Error closing database connection"
      this.handleError(error)
    }
  }

  databaseType(): DatabaseType {
    return "postgres"
  }

  async clear(tables: string[]): Promise<void> {
    if (process.env["NODE_ENV"] === "production") return

    try {
      this.checkConnection()
      await this.connection.tx(async (transaction: pgPromise.ITask<object>) => {
        await transaction.none("SET CONSTRAINTS ALL DEFERRED")
        const truncateQuery = `TRUNCATE TABLE ${tables
          .map((table) => `public.${table}`)
          .join(", ")} RESTART IDENTITY CASCADE`
        await transaction.none(truncateQuery)
        await transaction.none("SET CONSTRAINTS ALL IMMEDIATE")
      })
    } catch (error) {
      error.statement = "Error clearing tables"
      error.params = `Tables: ${JSON.stringify(tables)}`
      this.handleError(error)
    }
  }

  private transformQuery(query: string): string {
    let index = 1
    query = query.replace(/\?/g, () => `$${index++}`)
    query = query.replace(/WHERE 1/gi, "WHERE true")
    query = query.replace(/is_([a-z_]+)\s*=\s*1/gi, "is_$1 = true")
    query = query.replace(/is_([a-z_]+)\s*=\s*0/gi, "is_$1 = false")
    if (!/table_schema\s*=\s*'public'/i.test(query)) {
      if (/FROM\s+([a-z_]+)/gi.test(query)) query = query.replace(/FROM\s+([a-z_]+)/gi, "FROM public.$1")
      if (/JOIN\s+([a-z_]+)/gi.test(query)) query = query.replace(/JOIN\s+([a-z_]+)/gi, "JOIN public.$1")
      if (/INTO\s+([a-z_]+)/gi.test(query)) query = query.replace(/INTO\s+([a-z_]+)/gi, "INTO public.$1")
      if (/UPDATE\s+([a-z_]+)/gi.test(query) && !/DO UPDATE SET/gi.test(query))
        query = query.replace(/UPDATE\s+([a-z_]+)/gi, "UPDATE public.$1")
      if (/DELETE\s+([a-z_]+)/gi.test(query)) query = query.replace(/DELETE\s+([a-z_]+)/gi, "DELETE FROM public.$1")
    }
    return query
  }
}
