import jwt, { SignOptions } from "jsonwebtoken"
import { UseCase } from "../../../shared/domain/entity/UseCase"
import { User } from "../../../domain/entity"
import { UserRepository } from "../../repository"
import { UserDTO } from "@simulex/models"

export class LoginUser implements UseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: CredentialsDTO): Promise<LoginDTO> {
    await this.checkIfEmailExists(dto.email)
    const user = await this.userRepository.getByEmail(dto.email)
    if (!user.passwordValidate(dto.password)) {
      throw new Error("Invalid password")
    }
    const token = this.generateToken(user)
    return {
      user: user.toDTO(),
      token,
    }
  }

  private async checkIfEmailExists(email: string): Promise<User> {
    const user = await this.userRepository.getByEmail(email)
    if (!user) {
      throw new Error(`User with email ${email} does not exist`)
    }
    return user
  }

  private generateToken(user: User): string {
    const payload = { id: user.id, email: user.email }
    const secret = process.env["JWT_SECRET"] || "default_secret"
    const options: SignOptions = { expiresIn: "1h" }
    return jwt.sign(payload, secret, options)
  }
}

export interface CredentialsDTO {
  email: string
  password: string
}

export interface LoginDTO {
  user: UserDTO
  token: string
}
