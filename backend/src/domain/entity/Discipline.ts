import { Entity } from "../../shared/domain/entity"
import { DateBr } from "../../shared/domain/valueObject"
import { DisciplineState } from "../../shared/models"
import { randomUUID } from "crypto"
import { Topic } from "./Topic"
import { TopicList } from "./TopicList"
import { DisciplineDTO } from "@simulex/models"

interface DisciplineProps {
  disciplineId: string
  name: string
  topics: TopicList
  image: string
  isActive: boolean
  createdAt: DateBr
  updatedAt: DateBr | null
}

export class Discipline extends Entity<DisciplineProps> {
  private constructor(props: DisciplineProps) {
    super(props, "disciplineId")
  }

  static create(dto: CreateDisciplineCommand): Discipline {
    if (!dto.name) {
      throw new Error("Discipline - Missing required property: name")
    }
    const disciplineId = randomUUID()
    const props: DisciplineProps = {
      disciplineId,
      name: dto.name,
      topics: TopicList.create(disciplineId, []),
      image: "Base64 ou URL da image",
      isActive: true,
      createdAt: DateBr.create(),
      updatedAt: null,
    }
    const discipline = new Discipline(props)
    const topicClassificar = Topic.create({ name: "A classificar" })
    topicClassificar.setIsTopicClassify(true)
    discipline.topics.add(topicClassificar)
    return discipline
  }

  public toDTO(): DisciplineDTO {
    return {
      disciplineId: this.disciplineId,
      name: this.name,
      topics: this.topics.getItems().map((topic: Topic) => topic.toDTO()),
      image: this.image,
      isActive: this.isActive,
      createdAt: this.createdAt.formatoBr,
      updatedAt: this.updatedAt ? this.updatedAt?.formatoBr : null,
    }
  }

  public static toDomain(dto: DisciplineState): Discipline {
    const missingProperties = []
    if (!dto.disciplineId) missingProperties.push("disciplineId")
    if (!dto.name) missingProperties.push("name")
    if (!dto.topics) missingProperties.push("topics")
    if (!dto.createdAt) missingProperties.push("createdAt")
    if (missingProperties.length > 0) {
      throw new Error(`Discipline - Missing required properties: [${missingProperties.join(", ")}]`)
    }

    const discipline = new Discipline({
      disciplineId: dto.disciplineId,
      name: dto.name,
      topics: TopicList.create(dto.disciplineId, []),
      image: dto.image,
      isActive: !!dto.isActive,
      createdAt: DateBr.create(dto.createdAt),
      updatedAt: dto.updatedAt ? DateBr.create(dto.updatedAt) : null,
    })

    // Adiciona todos os assuntos root da disciplina e remove de dto.topics
    dto.topics
      .filter((topicState) => !topicState.topicParentId)
      .map((topicState) => {
        const topic = Topic.toDomain(topicState)
        topic.setTopicRootId(topic.topicId)
        topic.setDepth(1)
        discipline.topics.add(topic)
        dto.topics = dto.topics.filter((t) => t.topicId !== topic.topicId)
      })

    // Adiciona o assunto filho se o pai já foi adicionado e remove de dto.topics
    let contador = 0
    while (dto.topics.length > 0 || contador > 100) {
      dto.topics
        .filter((topicState) => topicState.topicParentId)
        .map((topicState) => {
          const topicParent = discipline.topic({
            topicId: topicState.topicParentId ?? "",
          })
          if (topicParent) {
            const topic = Topic.toDomain(topicState)
            topic.setTopicRootId(topicParent.topicRootId ?? "")
            topic.setDepth(topicParent.depth + 1)
            discipline.topics.add(topic)
            dto.topics = dto.topics.filter((t) => t.topicId !== topic.topicId)
          }
        })
      contador++
    }

    return discipline
  }

  get disciplineId() {
    return this.props.disciplineId
  }

  get name() {
    return this.props.name
  }

  get topics() {
    return this.props.topics
  }

  get image() {
    return this.props.image
  }

  get isActive() {
    return this.props.isActive
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  topic({ topicId, name }: { topicId?: string; name?: string }): Topic | null {
    if (topicId) {
      return this.topics.find(topicId)
    }
    if (name) {
      return this.topics.getItems().filter((topic: Topic) => topic.name.toLowerCase() === name.toLowerCase())[0]
    }
    return null
  }

  setTopicParent({ topic, topicParent }: { topic: Topic; topicParent: Topic }): void {
    if (!topic) {
      throw new Error("The child topic is required")
    }

    if (!topicParent) {
      throw new Error("The parent topic is required")
    }

    const topicChildId = topic.topicId
    const topicChild = this.topic({ topicId: topicChildId })
    if (!topicChild) {
      throw new Error(`Topic ID:${topicChildId} does not exist!`)
    }

    const topicParentId = topicParent.topicId
    topicParent = this.topic({ topicId: topicParentId })
    if (!topicParent) {
      throw new Error(`TopicParent ID:${topicParentId} does not exist!`)
    }

    if (topicChild.topicId === topicParent.topicId) {
      throw new Error("A topic cannot be its own child!")
    }

    if (topicParent.isTopicClassify) {
      throw new Error(`Topic \"A classificar\" cannot have children!`)
    }

    if (topicChild.isTopicClassify) {
      throw new Error(`Topic \"A classificar\" cannot be a child of another topic!`)
    }

    topicChild.setTopicParentId(topicParentId)
    topicChild.setTopicRootId(topicParent.topicRootId ?? "")
    topicChild.setDepth(topicParent.depth + 1)
  }

  topicsRoot(): Topic[] {
    return this.topics.getItems().filter((topic: Topic) => !topic.topicParentId)
  }

  topicsChildren(topicId: string): Topic[] {
    return this.topics.getItems().filter((topic: Topic) => topic.topicParentId === topicId)
  }

  topicsChildrenRecursive(topicId: string): Topic[] {
    const result: Topic[] = []

    const addChildren = (topic: Topic) => {
      result.push(topic)
      this.topicsChildren(topic.id).forEach(addChildren)
    }
    const topicChild = this.topic({ topicId })
    if (topicChild) addChildren(topicChild)

    return result.filter((topic) => topic.topicId !== topicId)
  }

  topicPath(topicId: string): Topic[] {
    const caminho: Topic[] = []
    let topic = this.topic({ topicId })
    while (topic) {
      caminho.push(topic)
      topic = this.topic({ topicId: topic.topicParentId ?? "" })
    }
    return caminho.reverse()
  }

  maxTopicsDepth(): number {
    let maxTopicsDepth = 1
    this.topics.getItems().forEach((topic: Topic) => {
      if (topic.depth > maxTopicsDepth) {
        maxTopicsDepth = topic.depth
      }
    })
    return maxTopicsDepth
  }

  activate(): void {
    this.props.isActive = true
  }

  deactivate(): void {
    this.props.isActive = false
  }

  updateName(name: string): void {
    this.props.name = name
  }

  statistics(topicId: string): TopicStatistics {
    if (!topicId) {
      throw new Error("Topic ID is required")
    }
    const topic = this.topic({ topicId })
    if (!topic) {
      throw new Error(`Topic ID:${topicId} does not exist!`)
    }

    // Assuntos filhos
    const children = this.topicsChildren(topicId)

    // Profundidade do assunto atual
    const depth = topic.depth

    // Maior profundidade de todos os assuntos filhos do assunto atual
    const maxDepth = this.calculateMaxDepth(topicId)

    // Qtde de assuntos filhos
    const qtyChildren = children ? children.length : 0

    // Qtde de assuntos filhos recursivamente
    const qtyChildrenRecursive = this.calculateQtyChildrenRecursive(topicId)

    return {
      depth,
      maxDepth,
      qtyChildren,
      qtyChildrenRecursive,
    }
  }

  private calculateMaxDepth(topicId: string): number {
    let maxDepth = this.topic({ topicId })?.depth ?? 0
    const children = this.topicsChildrenRecursive(topicId)
    children.forEach((topic: Topic) => {
      if (topic.depth > maxDepth) {
        maxDepth = topic.depth
      }
    })
    return maxDepth
  }

  private calculateQtyChildrenRecursive(topicId: string): number {
    return this.topicsChildrenRecursive(topicId).length
  }
}

export type CreateDisciplineCommand = {
  name: string
}

export type TopicStatistics = {
  depth: number
  maxDepth: number
  qtyChildren: number
  qtyChildrenRecursive: number
}
