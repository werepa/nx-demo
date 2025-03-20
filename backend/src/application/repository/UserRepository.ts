import { User } from "../../domain/entity/User"

export interface UserRepository {
  save(user: User): Promise<void>
  getAll({ showAll }?: { showAll?: boolean }): Promise<User[]>
  getById(id: string): Promise<User | null>
  getByEmail(email: string): Promise<User | null>
  clear(): Promise<void>
  invalidateToken(token: string): Promise<void>
  isTokenValid(token: string): Promise<boolean>
}
