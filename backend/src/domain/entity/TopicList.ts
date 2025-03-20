import { List } from "../../shared/domain/entity"
import { Topic } from "./Topic"
import { TopicDTO } from "@simulex/models"

export class TopicList extends List<Topic> {
  private constructor(
    private _disciplineId: string,
    topics: Topic[],
  ) {
    super(topics, "topicId")
  }

  static create(disciplineId: string, topics: Topic[]) {
    topics.map((topic) => {
      topic.setDisciplineId(disciplineId)
    })
    return new TopicList(disciplineId, topics)
  }

  override add(topic: Topic): void {
    if (this.exists(topic))
      throw new Error(`Topic ID:${topic.topicId} já existe!`)
    topic.setDisciplineId(this._disciplineId)
    this.items.push(topic)
    this.items = this.getItems()
  }

  protected compareKeys(a: Topic, b: Topic): boolean {
    return a.topicId === b.topicId
  }

  override getItems(orderField: string = "name"): Topic[] {
    return super.getItems(orderField)
  }

  getTopicsRoot(): Topic[] {
    return this.items.filter(
      (topic) => !topic.topicParentId || topic.topicParentId === topic.topicId,
    )
  }

  override toDTO<D = TopicDTO>(): D[] {
    return this.items.map((topic) => topic.toDTO()) as D[]
  }
}
