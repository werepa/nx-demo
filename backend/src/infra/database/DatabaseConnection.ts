export type QueryResult<T> = {
  rows: T[]
  rowCount: number
}

export interface DatabaseConnection {
  databaseType(): DatabaseType
  run(statement: string, params?: any): Promise<void>
  get<T>(statement: string, params?: any): Promise<T>
  all<T>(statement: string, params?: any): Promise<T[]>
  close(): Promise<void>
  query<T>(query: string, params?: any): Promise<QueryResult<T>>
  one<T>(query: string, params?: any): Promise<T>
  none(query: string, params?: any): Promise<void>
}

export type DatabaseType = "postgres" | "sqlite"
