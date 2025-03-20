import { UseCase } from "../../../shared/domain/entity/UseCase"
import { Quiz } from "../../../domain/entity/Quiz"
import { QuizRepository } from "../../repository/QuizRepository"

export class GetQuizById implements UseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(quizId: string): Promise<Quiz | null> {
    this.validateQuizId(quizId)
    return await this.findQuizById(quizId)
  }

  private validateQuizId(quizId: string): void {
    if (!quizId) {
      throw new Error("Quiz ID is required")
    }
  }

  private async findQuizById(quizId: string): Promise<Quiz | null> {
    const quiz = await this.quizRepository.getById(quizId)
    if (!quiz) {
      return null
    }
    return quiz
  }
}
