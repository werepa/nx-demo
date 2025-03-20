import { List } from "../../shared/domain/entity"
import { QuestionOption } from "./QuestionOption"
import { QuestionOptionDTO } from "@simulex/models"

export class QuestionOptionList extends List<QuestionOption> {
  private constructor(
    private _questionId: string,
    questionOptions: QuestionOption[],
  ) {
    super(questionOptions, "optionId")
  }

  static create(questionId: string, questionOptions: QuestionOption[]) {
    questionOptions.map((questionOption) => {
      questionOption.updateQuestionId(questionId)
      questionOption.updateItem(questionOptions.indexOf(questionOption))
    })
    return new QuestionOptionList(questionId, questionOptions)
  }

  // should set item with the next number in the list
  override add(questionOption: QuestionOption): void {
    if (this.exists(questionOption))
      throw new Error(`Option ID:${questionOption.optionId} já existe!`)
    questionOption.updateQuestionId(this._questionId)
    questionOption.updateItem(this.items.length + 1)
    this.items.push(questionOption)
    this.items = this.getItems()
  }

  // should reenumerate all items
  override remove(questionOption: QuestionOption): void {
    super.remove(questionOption)
    this.items = this.getItems()
    this.items.map((questionOption, index) => {
      questionOption.updateItem(index + 1)
    })
  }

  override getItems() {
    return [...super.getItems()].sort((a: any, b: any) => {
      if (a.item < b.item) return -1
      if (a.item > b.item) return 1
      return 0
    })
  }

  // should return options in random order, except if option text is "Nenhuma das anteriores", "Todas as anteriores" or "Todas as alternativas estão corretas", then it should be the last option
  getRandomItems() {
    const options = this.getItems().sort(() => Math.random() - 0.5)
    const pattern1 =
      /^\b(nenhuma|todas)\b.*\b(alternativa[s]?|anteriores|errada[s]?|correta[s]?)\b$/gi
    const pattern2 = /^\bn\.d\.a\.|nda\b$/gi

    const lastOptions = options.filter(
      (questionOption) =>
        pattern1.test(questionOption.text) ||
        pattern2.test(questionOption.text),
    )
    const otherOptions = options.filter(
      (questionOption) =>
        !pattern1.test(questionOption.text) &&
        !pattern2.test(questionOption.text),
    )

    return [...otherOptions, ...lastOptions]
  }

  protected compareKeys(a: QuestionOption, b: QuestionOption): boolean {
    return a.optionId === b.optionId
  }

  toDTO(): QuestionOptionDTO[] {
    return this.items.map((option) => option.toDTO())
  }
}
