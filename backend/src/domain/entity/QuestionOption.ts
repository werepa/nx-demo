import { Entity } from "../../shared/domain/entity"
import { QuestionOptionDTO } from "@simulex/models"
import { QuestionOptionState } from "../../shared/models"
import { randomUUID } from "crypto"

interface QuestionOptionProps {
  optionId: string
  text: string
  isCorrectAnswer: boolean
  item: number
  obs: string
  questionId: string
}

export class QuestionOption extends Entity<QuestionOptionProps> {
  private constructor(props: QuestionOptionProps) {
    super(props, "optionId")
  }

  static create(dto: CreateOptionInput): QuestionOption {
    if (!dto.text || dto.text.trim() === "") {
      throw new Error("Text of option is required")
    }
    const optionId = randomUUID()
    const props: QuestionOptionProps = {
      optionId,
      text: dto.text,
      isCorrectAnswer: dto.key ?? false,
      item: 1,
      obs: "",
      questionId: dto.questionId,
    }
    return new QuestionOption(props)
  }

  get optionId() {
    return this.props.optionId
  }

  get text() {
    return this.props.text
  }

  get key() {
    return this.props.isCorrectAnswer
  }

  get item() {
    return this.props.item
  }

  get obs() {
    return this.props.obs
  }

  get questionId() {
    return this.props.questionId
  }

  updateText(text: string) {
    this.props.text = text
  }

  updateKey(key: boolean) {
    this.props.isCorrectAnswer = key
  }

  updateItem(item: number) {
    this.props.item = item
  }

  updateQuestionId(questionId: string) {
    this.props.questionId = questionId
  }

  toPersistence(): QuestionOptionState {
    return {
      optionId: this.props.optionId,
      text: this.props.text,
      key: !!this.props.isCorrectAnswer,
      item: this.props.item,
      obs: this.props.obs,
      questionId: this.props.questionId,
    }
  }

  toDTO(): QuestionOptionDTO {
    return {
      optionId: this.props.optionId,
      text: this.props.text,
      isCorrectAnswer: !!this.props.isCorrectAnswer,
      item: this.props.item,
      obs: this.props.obs,
      questionId: this.props.questionId,
    }
  }

  public static toDomain(dto: QuestionOptionState): QuestionOption {
    if (!dto.optionId || !dto.text || dto.isCorrectAnswer === undefined || !dto.questionId) {
      throw new Error("Missing required properties")
    }

    return new QuestionOption({
      optionId: dto.optionId,
      text: dto.text,
      isCorrectAnswer: !!dto.isCorrectAnswer,
      item: dto.item ?? 1,
      obs: dto.obs ?? "",
      questionId: dto.questionId,
    })
  }
}

export type CreateOptionInput = {
  questionId: string
  text: string
  key?: boolean
}
