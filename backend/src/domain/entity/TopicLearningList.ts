import { List } from "../../shared/domain/entity"
import { TopicLearning } from "./TopicLearning"
import { TopicLearningDTO } from "@simulex/models"

interface TopicLearningComparison {
  qtyQuestionsRecursive: number
  maxQtyAllQuestionsDepth: number
  maxQtyAllQuestionsRootRecursive: number
  difficultyRecursive: number
  frequencyInDiscipline: number
  frequencyInDepth: number
}

export class TopicLearningList extends List<TopicLearning> {
  private constructor(private _userId: string, topicLearnings: TopicLearning[]) {
    super(topicLearnings, "topicLearningId")
  }

  static create(userId: string, topicLearnings: TopicLearning[]): TopicLearningList {
    topicLearnings.forEach((topicLearning) => {
      if (topicLearning.userId !== userId) {
        throw new Error(`User ID mismatch: expected ${userId}, got ${topicLearning.userId}`)
      }
    })
    return new TopicLearningList(userId, topicLearnings)
  }

  override add(topicLearning: TopicLearning): void {
    if (this.exists(topicLearning)) throw new Error(`TopicLearning ID:${topicLearning.topicLearningId} already exists!`)
    if (topicLearning.userId !== this._userId) {
      throw new Error("User not matches with userId")
    }

    this.items.push(topicLearning)
    this.items = this.getItems()
  }

  findByTopicId(topicId: string): TopicLearning | null {
    if (!topicId) throw new Error("Topic ID is required")
    return this.items.find((topicLearning) => topicLearning.topic.topicId === topicId) ?? null
  }

  override getItems(): TopicLearning[] {
    const replaceSpecialChars = (text: string): string => {
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }

    const getDepth = (topicLearning: TopicLearning): number => {
      let depth = 0
      let currentTopic = topicLearning.topic
      while (currentTopic.topicParentId && depth < 10) {
        depth++
        const parentTopicLearning = this.findByTopicId(currentTopic.topicParentId)
        if (!parentTopicLearning) break
        currentTopic = parentTopicLearning.topic
      }
      return depth
    }

    const isChildOf = (child: TopicLearning, potentialParent: TopicLearning): boolean => {
      let current = child
      let depth = 0
      while (current.topic.topicParentId && depth < 10) {
        depth++
        const parent = this.findByTopicId(current.topic.topicParentId)
        if (!parent) return false
        if (parent.topicLearningId === potentialParent.topicLearningId) return true
        current = parent
      }
      return false
    }

    return [...super.getItems()].sort((a: TopicLearning, b: TopicLearning) => {
      const depthA = getDepth(a)
      const depthB = getDepth(b)

      // If one is a descendant of the other, maintain hierarchy
      if (isChildOf(a, b)) return 1
      if (isChildOf(b, a)) return -1

      // If at same depth, sort alphabetically
      if (depthA === depthB) {
        const nameA = replaceSpecialChars(a.topic.name)
        const nameB = replaceSpecialChars(b.topic.name)
        return nameA.localeCompare(nameB)
      }

      // Sort by depth
      return depthA - depthB
    })
  }

  topicsChildren(topicLearning: TopicLearning): TopicLearning[] {
    return this.getItems().filter(
      (t: TopicLearning) =>
        t.topic.topicParentId === topicLearning.topic.topicId && t.topic.topicId !== topicLearning.topic.topicId
    )
  }

  topicsChildrenRecursive(topicLearning: TopicLearning): TopicLearning[] {
    const replaceSpecialChars = (text: string): string => {
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }

    const result: TopicLearning[] = []

    const addChildren = (topicLearning: TopicLearning) => {
      result.push(topicLearning)
      this.topicsChildren(topicLearning).forEach(addChildren)
    }

    addChildren(topicLearning)
    return result
      .filter((tl) => tl.topic.topicId !== topicLearning.topic.topicId)
      .sort((a: TopicLearning, b: TopicLearning) => {
        const name1 = replaceSpecialChars(a.topic.name)
        const name2 = replaceSpecialChars(b.topic.name)
        return name1.localeCompare(name2)
      })
  }

  public override toDTO(): TopicLearningDTO[] {
    return this.getItems().map((topicLearning) => topicLearning.toDTO())
  }

  compareValues(a: TopicLearningComparison, b: TopicLearningComparison): number {
    const scoreA = a.qtyQuestionsRecursive / a.maxQtyAllQuestionsDepth
    const scoreB = b.qtyQuestionsRecursive / b.maxQtyAllQuestionsDepth

    if (scoreA < scoreB) return -1
    if (scoreA > scoreB) return 1
    return 0
  }
}
