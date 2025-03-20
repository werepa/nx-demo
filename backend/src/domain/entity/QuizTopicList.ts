import { List } from "../../shared/domain/entity"
import { Topic } from "./Topic"

export class QuizTopicList extends List<Topic> {
  private constructor(topics: Topic[]) {
    super(topics, "topicId")
  }

  static create(quizId: string, topics: Topic[]) {
    return new QuizTopicList(topics)
  }

  override add(topic: Topic): void {
    if (!topic) throw new Error("Topic is required")
    if (topic.topicParentId) throw new Error("Only Topics Root are allowed!")
    if (this.exists(topic)) throw new Error(`Topic ID:${topic.topicId} already in the list!`)
    this.items.push(topic)
    this.items = this.getItems()
  }

  override remove(topic: Topic): void {
    super.remove(topic)
    this.items = this.getItems()
  }

  override getItems() {
    const replaceSpecialChars = (text: string): string => {
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }
    return [...super.getItems()].sort((a: any, b: any) => {
      const name1 = replaceSpecialChars(a.name)
      const name2 = replaceSpecialChars(b.name)
      if (a.classificarFlag) return -1
      return name1.localeCompare(name2)
    })
  }
}
