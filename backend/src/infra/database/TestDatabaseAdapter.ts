import { InMemoryAdapter } from "./InMemoryAdapter"
import { PgPromiseAdapter } from "./PgPromiseAdapter"

export function getTestDatabaseAdapter(): PgPromiseAdapter | InMemoryAdapter {
  process.env["NODE_ENV"] = "test"
  return new PgPromiseAdapter()
}
