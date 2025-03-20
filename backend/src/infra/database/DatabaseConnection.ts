export type QueryResult<T> = {
  rows: T[]
  rowCount: number
}

export type SqlParameter = string | number | boolean | Date | Buffer | null

export interface DatabaseConnection {
  databaseType(): DatabaseType
  run(statement: string, params?: SqlParameter[]): Promise<void>
  get<T>(statement: string, params?: SqlParameter[]): Promise<T>
  all<T>(statement: string, params?: SqlParameter[]): Promise<T[]>
  close(): Promise<void>
  query<T>(query: string, params?: SqlParameter[]): Promise<QueryResult<T>>
  one<T>(query: string, params?: SqlParameter[]): Promise<T>
  none(query: string, params?: SqlParameter[]): Promise<void>
}

export type DatabaseType = "postgres" | "sqlite"
