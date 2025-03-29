import { InMemoryAdapter } from "./InMemoryAdapter"
import { DatabaseType } from "./DatabaseConnection"

// filepath: backend/src/infra/database/InMemoryAdapter.test.ts

describe("InMemoryAdapter", () => {
  let adapter: InMemoryAdapter

  beforeEach(() => {
    process.env.NODE_ENV = "test"
    adapter = new InMemoryAdapter()
  })

  afterEach(async () => {
    if (adapter) {
      await adapter.close()
    }
  })

  afterAll(async () => {
    await adapter.close()
  })

  describe("databaseType", () => {
    it("should return sqlite as database type", () => {
      // Arrange & Act
      const type: DatabaseType = adapter.databaseType()

      // Assert
      expect(type).toBe("sqlite")
    })
  })

  describe("run", () => {
    it("should execute SQL statement without throwing an error", async () => {
      // Arrange
      const createTableStatement = "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)"

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
      await adapter.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")
      await adapter.none("INSERT INTO test (id, name) VALUES (1, 'Test Name')")

      // Act
      const result = await adapter.get<{ id: number; name: string }>("SELECT * FROM test WHERE id = 1")

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe(1)
      expect(result.name).toBe("Test Name")
    })

    it("should retrieve a single row using parameters", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")
      await adapter.none("INSERT INTO test (id, name) VALUES (1, 'Test Name')")
      await adapter.none("INSERT INTO test (id, name) VALUES (2, 'Another Name')")

      // Act
      const result = await adapter.get<{ id: number; name: string }>("SELECT * FROM test WHERE id = ?", [1])

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe(1)
      expect(result.name).toBe("Test Name")
    })

    it("should return undefined for non-existent row", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")

      // Act
      const result = await adapter.get<{ id: number; name: string }>("SELECT * FROM test WHERE id = 999")

      // Assert
      expect(result).toBeUndefined()
    })

    it("should throw an error for invalid query", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")

      // Act & Assert
      await expect(adapter.get("SELECT invalid FROM test")).rejects.toThrow()
    })
  })

  describe("all", () => {
    it("should retrieve all matching rows", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")
      await adapter.none("INSERT INTO test (id, name) VALUES (1, 'Name 1')")
      await adapter.none("INSERT INTO test (id, name) VALUES (2, 'Name 2')")

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
      await adapter.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT, type TEXT)")
      await adapter.none("INSERT INTO test (id, name, type) VALUES (1, 'Name 1', 'typeA')")
      await adapter.none("INSERT INTO test (id, name, type) VALUES (2, 'Name 2', 'typeB')")
      await adapter.none("INSERT INTO test (id, name, type) VALUES (3, 'Name 3', 'typeA')")

      // Act
      const results = await adapter.all<{ id: number; name: string; type: string }>(
        "SELECT * FROM test WHERE type = ? ORDER BY id",
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
      await adapter.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")

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
      await adapter.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")
      await adapter.none("INSERT INTO test (id, name) VALUES (1, 'Name 1')")
      await adapter.none("INSERT INTO test (id, name) VALUES (2, 'Name 2')")

      // Act
      const result = await adapter.query<{ id: number; name: string }>("SELECT * FROM test ORDER BY id")

      // Assert
      expect(result.rows).toHaveLength(2)
      expect(result.rowCount).toBe(2)
      expect(result.rows[0].id).toBe(1)
      expect(result.rows[1].id).toBe(2)
    })

    it("should return empty rows and zero rowCount for no matching rows", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")

      // Act
      const result = await adapter.query<{ id: number; name: string }>("SELECT * FROM test")

      // Assert
      expect(result.rows).toHaveLength(0)
      expect(result.rowCount).toBe(0)
    })

    it("should throw an error for invalid query", async () => {
      // Act & Assert
      await expect(adapter.query("SELECT invalid FROM test")).rejects.toThrow()
    })
  })

  describe("one", () => {
    it("should retrieve a single row", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")
      await adapter.none("INSERT INTO test (id, name) VALUES (1, 'Test Name')") // Changed to single quotes

      // Act
      const result = await adapter.one<{ id: number; name: string }>("SELECT * FROM test WHERE id = 1")

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe(1)
      expect(result.name).toBe("Test Name")
    })

    it("should return undefined for non-existent row", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")

      // Act
      const result = await adapter.one<{ id: number; name: string }>("SELECT * FROM test WHERE id = 999")

      // Assert
      expect(result).toBeUndefined()
    })

    it("should throw an error for invalid query", async () => {
      // Act & Assert
      await expect(adapter.one("SELECT invalid FROM test")).rejects.toThrow()
    })
  })

  describe("none", () => {
    it("should execute SQL statement without returning data", async () => {
      // Arrange
      await adapter.run("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")

      // Act & Assert
      await expect(adapter.none("INSERT INTO test (id, name) VALUES (1, 'Test Name')")).resolves.not.toThrow()
    })

    it("should throw an error for invalid SQL statement", async () => {
      // Act & Assert
      await expect(adapter.none("INSERT INVALID INTO test")).rejects.toThrow()
    })
  })

  describe("close", () => {
    it("should close the database connection", async () => {
      // Arrange & Act
      await adapter.close()

      // Assert - After closing, any operation should throw
      await expect(adapter.run("SELECT 1")).rejects.toThrow("Database connection is not open")

      adapter = new InMemoryAdapter()
    })
  })
})
