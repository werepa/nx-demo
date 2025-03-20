import { UseCase } from "../../../shared/domain/entity/UseCase"
import { Quiz } from "../../../domain/entity/Quiz"
import { QuizRepository } from "../../repository/QuizRepository"

export class GetQuizzes implements UseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(dto: Input): Promise<Quiz[]> {
    this.validateUserId(dto.userId)
    return await this.quizRepository.getAll({
      userId: dto.userId,
      disciplineId: dto.disciplineId,
    })
  }

  private validateUserId(userId: string): void {
    if (!userId) {
      throw new Error("User ID is required")
    }
  }
}

type Input = {
  userId: string
  disciplineId?: string
}
