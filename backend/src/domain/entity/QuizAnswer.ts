import { Entity } from "../../shared/domain/entity"
import { DateBr } from "../../shared/domain/valueObject"
import { QuizAnswerState } from "../../shared/models"
import { QuizAnswerDTO } from "@simulex/models"
import { randomUUID } from "crypto"

export interface QuizAnswerProps {
  quizAnswerId: string
  quizId: string
  questionId: string
  topicId: string
  correctOptionId: string | null
  userOptionId: string | null
  isUserAnswerCorrect: boolean
  canRepeat: boolean
  createdAt: DateBr
}

export class QuizAnswer extends Entity<QuizAnswerProps> {
  private constructor(props: QuizAnswerProps) {
    super(props, "answerId")
  }

  static create(dto: CreateQuizAnswerInput): QuizAnswer {
    if (!dto.quizId || !dto.questionId || dto.isUserAnswerCorrect === undefined || !dto.topicId) {
      throw new Error("Missing required properties")
    }
    const answerId = randomUUID()
    const props: QuizAnswerProps = {
      quizAnswerId: answerId,
      quizId: dto.quizId,
      questionId: dto.questionId,
      topicId: dto.topicId,
      correctOptionId: dto.correctOptionId,
      userOptionId: dto.userOptionId,
      isUserAnswerCorrect: dto.isUserAnswerCorrect,
      canRepeat: false,
      createdAt: DateBr.create(),
    }
    return new QuizAnswer(props)
  }

  public static toDomain(dto: QuizAnswerState): QuizAnswer {
    if (
      !dto.quizAnswerId ||
      !dto.quizId ||
      !dto.questionId ||
      !dto.topicId ||
      dto.isUserAnswerCorrect === undefined ||
      !dto.createdAt
    ) {
      throw new Error("Missing required properties")
    }

    const props: QuizAnswerProps = {
      quizAnswerId: dto.quizAnswerId,
      quizId: dto.quizId,
      questionId: dto.questionId,
      topicId: dto.topicId,
      correctOptionId: dto.correctOptionId,
      userOptionId: dto.userOptionId,
      isUserAnswerCorrect: dto.isUserAnswerCorrect,
      canRepeat: dto.canRepeat,
      createdAt: DateBr.create(dto.createdAt),
    }
    return new QuizAnswer(props)
  }

  get quizAnswerId() {
    return this.props.quizAnswerId
  }

  get quizId() {
    return this.props.quizId
  }

  get questionId() {
    return this.props.questionId
  }

  get topicId() {
    return this.props.topicId
  }

  get correctOptionId() {
    return this.props.correctOptionId
  }

  get userOptionId() {
    return this.props.userOptionId
  }

  get isUserAnswerCorrect() {
    return this.props.isUserAnswerCorrect
  }

  get canRepeat() {
    return this.props.canRepeat
  }

  get createdAt() {
    return this.props.createdAt
  }

  public toDTO(): QuizAnswerDTO {
    return {
      quizAnswerId: this.quizAnswerId,
      quizId: this.quizId,
      questionId: this.questionId,
      topicId: this.topicId,
      correctOptionId: this.correctOptionId,
      userOptionId: this.userOptionId,
      isUserAnswerCorrect: this.isUserAnswerCorrect,
      canRepeat: this.props.canRepeat,
      createdAt: this.createdAt.value,
    }
  }
}

export type CreateQuizAnswerInput = {
  quizId: string
  questionId: string
  topicId: string
  correctOptionId: string | null
  userOptionId: string | null
  isUserAnswerCorrect?: boolean
}
