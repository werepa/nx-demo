import { Question } from "../../../domain/entity/Question"
import { QuestionRepository } from "../../repository/QuestionRepository"

export class CreateQuestion {
  constructor(private questionRepository: QuestionRepository) {}

  async execute(dto: CreateQuestionDTO): Promise<Question> {
    const question = Question.create(dto)
    await this.questionRepository.save(question)
    return question
  }
}

export type CreateQuestionDTO = {
  topicId: string
  topicRootId: string
  prompt?: string
  options: { text: string; key?: boolean }[]
  year?: string
  sourceId?: string
  createdBy?: string
}
