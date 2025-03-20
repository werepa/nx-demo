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

  private prepareUserParams(user: User): any[] {
    return [user.name, user.email, user.password, user.role, user.image, user.isActive ? this.dbType(1) : this.dbType(0)]
  }

  private async updateUser(user: User): Promise<void> {
    await this.connection.none(
      `
      UPDATE users 
      SET name = $1, email = $2, password = $3, role = $4, image = $5, is_active = $6, updated_at = $7 
      WHERE user_id = $8
    `,
      [
        user.name,
        user.email,
        user.password,
        user.role,
        user.image,
        this.dbType(user.isActive),
        user.updatedAt?.formatoBr || null,
        user.userId,
      ]
    )
  }

  private async insertUser(user: User): Promise<void> {
    await this.connection.none(
      `
      INSERT INTO users (user_id, name, email, password, role, image, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        user.userId,
        user.name,
        user.email,
        user.password,
        user.role,
        user.image,
        this.dbType(user.isActive),
        user.createdAt.formatoBr,
        user.updatedAt?.formatoBr || null,
      ]
    )
  }

  async save(user: User): Promise<void> {
    const existingUser = await this.getById(user.userId)
    if (existingUser) {
      await this.updateUser(user)
    } else {
      await this.insertUser(user)
    }
  }

  async getById(userId: string): Promise<User | null> {
    const userFromDB = await this.connection.one<RawUserData>(
      `
      SELECT user_id, name, email, password, role, image, is_active, created_at, updated_at 
      FROM users 
      WHERE user_id = $1
    `,
      [userId]
    )

    if (!userFromDB) return null
    return this.mapToDomain(this.convertDatabaseUser(userFromDB))
  }

  async getByEmail(email: string): Promise<User | null> {
    const userFromDB = await this.connection.one<RawUserData>(
      `
      SELECT user_id, name, email, password, role, image, is_active, created_at, updated_at 
      FROM users 
      WHERE email = $1
    `,
      [email]
    )

    if (!userFromDB) return null
    return this.mapToDomain(this.convertDatabaseUser(userFromDB))
  }

  async getAll({ showAll }: { showAll?: boolean } = { showAll: false }): Promise<User[]> {
    const queryUserParts = ["SELECT * FROM user"]
    if (!showAll) queryUserParts.push(`WHERE is_active = ${this.dbType(1)}`)
    queryUserParts.push("ORDER BY name")
    const queryUser = queryUserParts.join(" ")
    const usersFromDB = await this.connection.all(queryUser)
    return usersFromDB.map((userFromDB: any) => User.toDomain(this.convertDatabaseUser(userFromDB)))
  }

  async clear(): Promise<void> {
    if (this.connection.databaseType() === "postgres") {
      const tables = ["user"]
      const truncateQuery = `TRUNCATE TABLE ${tables.map((table) => `public.${table}`).join(", ")} CASCADE`
      return this.connection.run(truncateQuery)
    } else {
      return this.connection.run("DELETE FROM user")
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
