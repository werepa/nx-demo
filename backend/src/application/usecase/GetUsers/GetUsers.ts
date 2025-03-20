import { User } from "../../../domain/entity/User"
import { UserRepository } from "../../repository/UserRepository"

export class GetUsers {
  private userRepository: UserRepository

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  async execute(
    { showAll }: { showAll?: boolean } = { showAll: false },
  ): Promise<User[]> {
    return this.userRepository.getAll({ showAll })
  }
}
