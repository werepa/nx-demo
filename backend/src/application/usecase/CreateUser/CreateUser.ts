import { UseCase } from "../../../shared/domain/entity/UseCase"
import { User } from "../../../domain/entity"
import { UserRepository } from "../../repository"

export class CreateUser implements UseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: Input): Promise<User> {
    await this.checkIfEmailExists(dto.email)
    const user = User.create(dto)
    await this.userRepository.save(user)
    return user
  }

  private async checkIfEmailExists(email: string): Promise<void> {
    const userEmailExists = await this.userRepository.getByEmail(email)
    if (userEmailExists) {
      throw new Error(`Email ${email} already exists`)
    }
  }
}

type Input = {
  name: string
  email: string
  password: string
}
