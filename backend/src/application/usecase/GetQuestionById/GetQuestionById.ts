import { UseCase } from '../../../shared/domain/entity/UseCase';
import { Question } from '../../../domain/entity/Question';
import { QuestionRepository } from '../../repository/QuestionRepository';

export class GetQuestionById implements UseCase {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(questionId: string): Promise<Question | null> {
    this.validateQuestionId(questionId);
    return await this.findQuestionById(questionId);
  }

  private validateQuestionId(questionId: string): void {
    if (!questionId) {
      throw new Error('Question ID is required');
    }
  }

  private async findQuestionById(questionId: string): Promise<Question | null> {
    const question = await this.questionRepository.getById(questionId);
    if (!question) {
      throw new Error(`Question ID:${questionId} does not exist!`);
    }
    return question;
  }
}
