import { DatabaseConnection } from "../database/DatabaseConnection"
import { UserRepository } from "../../application/repository/UserRepository"
import { User } from "../../domain/entity/User"
import { UserState } from "../../shared/models"
import { UserPassword } from "../../domain/valueObject"

interface RawUserData {
  user_id: string
  name: string
  email: string
  password: string
  role: string
  image: string
  is_active: boolean | number
  created_at: string
  updated_at: string | null
}

export class UserRepositoryDatabase implements UserRepository {
  private tokenBlacklist: Set<string> = new Set()

  constructor(private readonly connection: DatabaseConnection) {}

  private prepareUserParams(user: User): (string | boolean | number)[] {
    return [user.name, user.email, user.password, user.role, user.image, user.isActive ? this.dbType(1) : this.dbType(0)]
  }

  async save(user: User): Promise<void> {
    const existingUser = await this.getById(user.userId)
    if (existingUser) {
      const query =
        "UPDATE users SET name = ?, email = ?, password = ?, role = ?, image = ?, is_active = ? WHERE user_id = ?"
      const params = [
        user.name,
        user.email,
        user.password,
        user.role,
        user.image,
        user.isActive ? this.dbType(1) : this.dbType(0),
        user.userId,
      ]
      await this.connection.run(query, params)
      return
    }

    const query = "INSERT INTO users (user_id, name, email, password, role, image, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)"
    const params = [
      user.userId,
      user.name,
      user.email,
      user.password,
      user.role,
      user.image,
      user.isActive ? this.dbType(1) : this.dbType(0),
    ]
    await this.connection.run(query, params)
  }

  async getById(userId: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE user_id = ?"
    const userFromDB = await this.connection.get<RawUserData>(query, [userId])
    return userFromDB ? User.toDomain(this.convertDatabaseUser(userFromDB)) : null
  }

  async getByEmail(email: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE email = ?"
    const userFromDB = await this.connection.get<RawUserData>(query, [email])
    return userFromDB ? User.toDomain(this.convertDatabaseUser(userFromDB)) : null
  }

  async getAll({ showAll }: { showAll?: boolean } = { showAll: false }): Promise<User[]> {
    const queryUserParts = ["SELECT * FROM users"]
    if (!showAll) queryUserParts.push(`WHERE is_active = ${this.dbType(1)}`)
    queryUserParts.push("ORDER BY name")
    const queryUser = queryUserParts.join(" ")
    const usersFromDB = await this.connection.all(queryUser)
    return usersFromDB.map((userFromDB: RawUserData) => User.toDomain(this.convertDatabaseUser(userFromDB)))
  }

  async clear(): Promise<void> {
    if (process.env["NODE_ENV"] === "production") return

    if (this.connection.databaseType() === "postgres") {
      const tables = ["users"]
      const truncateQuery = `TRUNCATE TABLE ${tables.map((table) => `public.${table}`).join(", ")} CASCADE`
      return this.connection.run(truncateQuery)
    } else {
      return this.connection.run("DELETE FROM users")
    }
  }

  private convertDatabaseUser(userFromDB: RawUserData): UserState {
    return {
      userId: userFromDB.user_id,
      name: userFromDB.name,
      email: userFromDB.email,
      password: UserPassword.create(userFromDB.password, true).value,
      role: userFromDB.role,
      image: userFromDB.image,
      isActive: !!userFromDB.is_active,
      createdAt: new Date(userFromDB.created_at),
      updatedAt: userFromDB.updated_at ? new Date(userFromDB.updated_at) : null,
    }
  }

  private mapToDomain(userData: UserState): User {
    return User.toDomain(userData)
  }

  private dbType(value: boolean | number): boolean | number {
    if (typeof value === "boolean") {
      return value ? 1 : 0
    }
    const result = this.connection.databaseType() === "postgres" ? Boolean(value) : value
    return result
  }

  async invalidateToken(token: string): Promise<void> {
    this.tokenBlacklist.add(token)
  }

  async isTokenValid(token: string): Promise<boolean> {
    return !this.tokenBlacklist.has(token)
  }
}
