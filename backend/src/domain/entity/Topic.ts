import { Entity } from "../../shared/domain/entity"
import { DateBr } from "../../shared/domain/valueObject"
import { TopicState } from "../../shared/models"
import { TopicDTO } from "@simulex/models"
import { randomUUID } from "crypto"

interface TopicProps {
  topicId: string
  name: string
  disciplineId: string
  isTopicClassify: boolean
  topicParentId: string | null
  topicRootId: string
  depth: number
  dependencies: string[]
  obs: string
  isActive: boolean
  createdAt: DateBr
  updatedAt: DateBr | null
  isChanged: boolean
}

export class Topic extends Entity<TopicProps> {
  private constructor(props: TopicProps) {
    super(props, "topicId")
    if (!props.topicParentId && !props.topicRootId) {
      this.props.topicRootId = this.topicId
    }
  }

  static create(dto: CreateTopicCommand): Topic {
    if (!dto.name) {
      throw new Error("Topic - Missing required property: name")
    }

    const topicId = randomUUID()
    const props: TopicProps = {
      topicId,
      name: dto.name,
      disciplineId: "",
      isTopicClassify: false,
      topicParentId: null,
      topicRootId: topicId,
      depth: 1,
      dependencies: [],
      obs: "",
      isActive: true,
      createdAt: DateBr.create(),
      updatedAt: null,
      isChanged: false,
    }
    const topic = new Topic(props)
    return topic
  }

  public static toDomain(dto: TopicState): Topic {
    const missingProperties = []
    if (!dto.topicId) missingProperties.push("topicId")
    if (!dto.name) missingProperties.push("name")
    if (!dto.disciplineId) missingProperties.push("disciplineId")
    if (!dto.createdAt) missingProperties.push("createdAt")
    if (missingProperties.length > 0) {
      throw new Error(`Topic - Missing required properties: [${missingProperties.join(", ")}]`)
    }

    return new Topic({
      topicId: dto.topicId,
      disciplineId: dto.disciplineId,
      name: dto.name,
      isTopicClassify: !!dto.isTopicClassify,
      topicParentId: dto.topicParentId ?? null,
      topicRootId: dto.topicRootId ?? dto.topicId,
      depth: dto.depth ? Number(dto.depth) : 1,
      dependencies: dto.dependencies,
      obs: dto.obs,
      isActive: !!dto.isActive,
      createdAt: DateBr.create(dto.createdAt),
      updatedAt: dto.updatedAt ? DateBr.create(dto.updatedAt) : null,
      isChanged: false,
    })
  }

  get topicId() {
    return this.props.topicId
  }

  get name() {
    return this.props.name
  }

  get disciplineId() {
    return this.props.disciplineId
  }

  get isTopicClassify() {
    return this.props.isTopicClassify
  }

  get depth() {
    return this.props.depth
  }

  get dependencies() {
    return this.props.dependencies
  }

  get topicParentId() {
    return this.props.topicParentId
  }

  get topicRootId() {
    return this.props.topicRootId
  }

  get obs() {
    return this.props.obs
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

  get isChanged() {
    return this.props.isChanged
  }

  public isRoot() {
    return this.topicId === this.topicRootId && !this.topicParentId
  }

  public setChanged(date?: Date) {
    this.props.updatedAt = DateBr.create(date)
    this.props.isChanged = true
  }

  public setDependencies(dependencies: string[]): void {
    this.props.dependencies = dependencies
    this.setChanged()
  }

  public setDepth(depth: number): void {
    this.props.depth = depth
  }

  public setIsTopicClassify(flag: boolean): void {
    this.props.isTopicClassify = flag
  }

  public updateName(name: string): void {
    if (this.isTopicClassify) {
      throw new Error(`Cannot change the name of the topic \"A classificar\"`)
    }
    this.props.name = name
    this.setChanged()
  }

  public activate(isActive: boolean): void {
    this.props.isActive = isActive
    this.setChanged()
  }

  public deactivate(): void {
    if (this.isTopicClassify) {
      throw new Error(`Cannot deactivate the topic \"A classificar\"`)
    }
    this.props.isActive = false
    this.setChanged()
  }

  public setDisciplineId(disciplineId: string): void {
    this.props.disciplineId = disciplineId
    this.setChanged()
  }

  public setTopicParentId(topicParentId: string): void {
    this.props.topicParentId = topicParentId
    this.setChanged()
  }

  public setTopicRootId(topicRootId: string): void {
    this.props.topicRootId = topicRootId
  }

  public toDTO(): TopicDTO {
    return {
      topicId: this.topicId,
      name: this.name,
      disciplineId: this.disciplineId,
      isTopicClassify: this.isTopicClassify,
      topicParentId: this.topicParentId,
      topicRootId: this.topicRootId,
      depth: this.depth,
      dependencies: this.dependencies,
      obs: this.obs,
      isActive: this.isActive,
      createdAt: this.createdAt.formatoBr,
      updatedAt: this.updatedAt ? this.updatedAt.formatoBr : null,
    }
  }
}

export type CreateTopicCommand = {
  name: string
  disciplineId?: string
}
