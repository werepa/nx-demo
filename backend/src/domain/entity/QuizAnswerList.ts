import { List } from "../../shared/domain/entity"
import { QuizAnswer } from "./QuizAnswer"

export class QuizAnswerList extends List<QuizAnswer> {
  private constructor(private quizId: string, answers: QuizAnswer[]) {
    super(answers, "quizAnswerId")
  }

  static create(quizId: string, quizAnswers: QuizAnswer[]): QuizAnswerList {
    if (quizId) {
      quizAnswers = quizAnswers.filter((answer: QuizAnswer) => answer.quizId === quizId)
    }
    return new QuizAnswerList(quizId, quizAnswers)
  }

  override add(quizAnswer: QuizAnswer): void {
    if (!quizAnswer) throw new Error("QuizAnswer is required")
    if (this.quizId && quizAnswer.quizId !== this.quizId) throw new Error("QuizAnswer not matches with Quiz")
    if (this.exists(quizAnswer)) throw new Error(`Answer ID:${quizAnswer.quizAnswerId} already in the list!`)
    this.items.push(quizAnswer)
    this.items = this.getItems()
  }

  override remove(quizAnswer: QuizAnswer): void {
    super.remove(quizAnswer)
    this.items = this.getItems()
  }

  override getItems(): QuizAnswer[] {
    return [...super.getItems()].sort((a: QuizAnswer, b: QuizAnswer) => {
      return a.createdAt.value.getTime() - b.createdAt.value.getTime()
    })
  }

  filterByTopic(topicId: string): QuizAnswerList {
    return QuizAnswerList.create(
      null,
      this.getItems().filter((answer: QuizAnswer) => answer.topicId === topicId)
    )
  }

  // Get the last n answers of the list
  getShortHistory(n: number = 5): QuizAnswer[] {
    return this.getItems().slice(-n)
  }
}
