import { QuestionRepository } from '../../repository/QuestionRepository';
import { Question } from '../../../domain/entity/Question';

export class GetQuestions {
  private questionRepository: QuestionRepository;

  constructor(questionRepository: QuestionRepository) {
    this.questionRepository = questionRepository;
  }

  async execute(
    { topicId, showAll }: { topicId: string; showAll?: boolean } = {
      topicId: null,
      showAll: false,
    }
  ): Promise<Question[]> {
    this.validateTopicId(topicId);
    return this.questionRepository.getAll({ topicId, showAll });
  }

  private validateTopicId(topicId: string): void {
    if (!topicId) {
      throw new Error('Topic ID is required');
    }
  }
}
