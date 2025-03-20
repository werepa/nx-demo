import { QuizRepository } from "../repository"
import { QuizDTO } from "@simulex/models"

export class GetQuizById {
  constructor(readonly quizRepository: QuizRepository) {}

  async execute(input: { quizId: string }): Promise<QuizDTO | null> {
    const quiz = await this.quizRepository.getById(input.quizId)
    if (!quiz) return null
    return quiz.toDTO()
  }
}
