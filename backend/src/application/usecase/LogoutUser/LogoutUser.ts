import { UseCase } from "../../../shared/domain/entity/UseCase"
import { UserRepository } from "../../repository/UserRepository"

export class LogoutUser implements UseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(token: string): Promise<void> {
    const isValid = await this.userRepository.isTokenValid(token)
    if (!isValid) {
      throw new Error("Invalid token")
    }
    await this.userRepository.invalidateToken(token)
  }
}
