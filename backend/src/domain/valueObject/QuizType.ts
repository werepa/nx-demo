import { QuizTypeEnum } from "../../shared/enum"

export class QuizType {
  private readonly _value: QuizTypeEnum

  private constructor(value: string) {
    switch (value.toLowerCase()) {
      case "random":
        this._value = QuizTypeEnum.RANDOM
        break
      case "learning":
        this._value = QuizTypeEnum.LEARNING
        break
      case "review":
        this._value = QuizTypeEnum.REVIEW
        break
      case "check":
        this._value = QuizTypeEnum.CHECK
        break
      default:
        this._value = QuizTypeEnum.RANDOM
    }
  }

  static create(value: string = "random"): QuizType {
    return new QuizType(value)
  }

  get value(): QuizTypeEnum {
    return this._value
  }
}
