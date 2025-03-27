/* eslint-disable @typescript-eslint/no-unused-vars */
import { PgPromiseAdapter } from "./PgPromiseAdapter"
import { DatabaseType } from "./DatabaseConnection"

describe("PgPromiseAdapter", () => {
  let adapter: PgPromiseAdapter
  const TEST_DB_URL = process.env.TEST_DATABASE_URL
  process.env.NODE_ENV = "test"

  beforeEach(async () => {
    adapter = new PgPromiseAdapter(TEST_DB_URL)
    // Clear any existing test tables
    try {
      await adapter.run("DROP TABLE IF EXISTS test")
    } catch (error: unknown) {
      // Ignore errors from non-existent tables, intentionally ignored
    }
  })

  afterEach(async () => {
    await adapter.close()
  })

  describe("databaseType", () => {
    it("should return postgres as database type", () => {
      // Arrange & Act
      const type: DatabaseType = adapter.databaseType()

      // Assert
      expect(type).toBe("postgres")
    })
  })

  describe("run", () => {
    it("should execute SQL statement without throwing an error", async () => {
      // Arrange
      const createTableStatement = "CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT)"

      // Act & Assert
      await expect(adapter.run(createTableStatement)).resolves.not.toThrow()
    })

    it("should throw an error for invalid SQL statement", async () => {
      // Arrange
      const invalidStatement = "CREATE INVALID TABLE test"

      // Act & Assert
      await expect(adapter.run(invalidStatement)).rejects.toThrow()
    })
  })

  describe("get", () => {
    it("should retrieve a single row", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT)")
      await adapter.run("INSERT INTO test (name) VALUES ('Test Name')")

      // Act
      const result = await adapter.get<{ id: number; name: string }>("SELECT * FROM test WHERE id = 1")

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe(1)
      expect(result.name).toBe("Test Name")
    })

    it("should retrieve a single row using parameters", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT)")
      await adapter.run("INSERT INTO test (name) VALUES ('Test Name')")
      await adapter.run("INSERT INTO test (name) VALUES ('Another Name')")

      // Act
      const result = await adapter.get<{ id: number; name: string }>("SELECT * FROM test WHERE id = $1", [1])

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe(1)
      expect(result.name).toBe("Test Name")
    })

    it("should return null for non-existent row", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT)")

      // Act
      const result = await adapter.get<{ id: number; name: string }>("SELECT * FROM test WHERE id = 999")

      // Assert
      expect(result).toBeNull()
    })

    it("should throw an error for invalid query", async () => {
      // Act & Assert
      await expect(adapter.get("SELECT invalid FROM test")).rejects.toThrow()
    })
  })

  describe("all", () => {
    it("should retrieve all matching rows", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT)")
      await adapter.run("INSERT INTO test (name) VALUES ('Name 1')")
      await adapter.run("INSERT INTO test (name) VALUES ('Name 2')")

      // Act
      const results = await adapter.all<{ id: number; name: string }>("SELECT * FROM test ORDER BY id")

      // Assert
      expect(results).toHaveLength(2)
      expect(results[0].id).toBe(1)
      expect(results[0].name).toBe("Name 1")
      expect(results[1].id).toBe(2)
      expect(results[1].name).toBe("Name 2")
    })

    it("should retrieve matching rows using parameters", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT, type TEXT)")
      await adapter.run("INSERT INTO test (name, type) VALUES ('Name 1', 'typeA')")
      await adapter.run("INSERT INTO test (name, type) VALUES ('Name 2', 'typeB')")
      await adapter.run("INSERT INTO test (name, type) VALUES ('Name 3', 'typeA')")

      // Act
      const results = await adapter.all<{ id: number; name: string; type: string }>(
        "SELECT * FROM test WHERE type = $1 ORDER BY id",
        ["typeA"]
      )

      // Assert
      expect(results).toHaveLength(2)
      expect(results[0].id).toBe(1)
      expect(results[0].type).toBe("typeA")
      expect(results[1].id).toBe(3)
      expect(results[1].type).toBe("typeA")
    })

    it("should return empty array for no matching rows", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT)")

      // Act
      const results = await adapter.all<{ id: number; name: string }>("SELECT * FROM test")

      // Assert
      expect(results).toHaveLength(0)
    })

    it("should throw an error for invalid query", async () => {
      // Act & Assert
      await expect(adapter.all("SELECT invalid FROM test")).rejects.toThrow()
    })
  })

  describe("query", () => {
    it("should retrieve all matching rows with row count", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT)")
      await adapter.run("INSERT INTO test (name) VALUES ('Name 1')")
      await adapter.run("INSERT INTO test (name) VALUES ('Name 2')")

      // Act
      const result = await adapter.all<{ id: number; name: string }>("SELECT * FROM test ORDER BY id")

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
    })

    it("should return empty rows and zero rowCount for no matching rows", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT)")

      // Act
      const result = await adapter.all<{ id: number; name: string }>("SELECT * FROM test")

      // Assert
      expect(result).toHaveLength(0)
    })

    it("should throw an error for invalid query", async () => {
      // Act & Assert
      await expect(adapter.all("SELECT invalid FROM test")).rejects.toThrow()
    })
  })

  describe("one", () => {
    it("should retrieve a single row", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT)")
      await adapter.run("INSERT INTO test (name) VALUES ('Test Name')")

      // Act
      const result = await adapter.get<{ id: number; name: string }>("SELECT * FROM test WHERE id = 1")

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe(1)
      expect(result.name).toBe("Test Name")
    })

    it("should return null for non-existent row", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT)")

      // Act
      const result = await adapter.get<{ id: number; name: string }>("SELECT * FROM test WHERE id = 999")

      // Assert
      expect(result).toBeNull()
    })

    it("should throw an error for invalid query", async () => {
      // Act & Assert
      await expect(adapter.get("SELECT invalid FROM test")).rejects.toThrow()
    })
  })

  describe("none", () => {
    it("should execute SQL statement without returning data", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT)")

      // Act & Assert
      await expect(adapter.run("INSERT INTO test (name) VALUES ('Test Name')")).resolves.not.toThrow()
    })

    it("should throw an error for invalid SQL statement", async () => {
      // Act & Assert
      await expect(adapter.run("INSERT INVALID INTO test")).rejects.toThrow()
    })
  })

  describe("transformQuery", () => {
    it("should transform query with placeholders and conditions", () => {
      // Arrange
      const query = "SELECT * FROM users WHERE id = ? AND is_active = 1 AND name LIKE ?"
      const expectedQuery = "SELECT * FROM public.users WHERE id = $1 AND is_active = true AND name LIKE $2"
      const params = ["123", "%John%"]
      const expectedParams = ["123", "%John%"]
      // Act
      const transformedQuery = adapter["transformQuery"](query)
      // Assert
      expect(transformedQuery).toBe(expectedQuery)
    })
    it("should transform query with table names", () => {
      // Arrange
      const query = "SELECT * FROM users JOIN orders ON users.id = orders.user_id"
      const expectedQuery = "SELECT * FROM public.users JOIN public.orders ON users.id = orders.user_id"
      // Act
      const transformedQuery = adapter["transformQuery"](query)
      // Assert
      expect(transformedQuery).toBe(expectedQuery)
    })
    it("should transform query with WHERE 1", () => {
      // Arrange
      const query = "SELECT * FROM users WHERE 1 AND is_active = 1"
      const expectedQuery = "SELECT * FROM public.users WHERE true AND is_active = true"
      // Act
      const transformedQuery = adapter["transformQuery"](query)
      // Assert
      expect(transformedQuery).toBe(expectedQuery)
    })
    it("should transform query with is_active = 0", () => {
      // Arrange
      const query = "SELECT * FROM users WHERE is_active = 0"
      const expectedQuery = "SELECT * FROM public.users WHERE is_active = false"
      // Act
      const transformedQuery = adapter["transformQuery"](query)
      // Assert
      expect(transformedQuery).toBe(expectedQuery)
    })

    describe("close", () => {
      it("should close the database connection", async () => {
        // Arrange & Act
        await adapter.close()

        // Assert - After closing, any operation should throw
        await expect(adapter.run("SELECT 1")).rejects.toThrow()
      })
    })
  })
})
