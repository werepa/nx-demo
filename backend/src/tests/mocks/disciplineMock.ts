import { faker } from "@faker-js/faker"
import { Discipline, Topic, TopicList } from "../../domain/entity"
import { DisciplineDTO } from "@simulex/models"
import { DateBr } from "../../shared/domain/valueObject"
import { DisciplineState, TopicState } from "../../shared/models"

interface DisciplineMockOptions {
  disciplineId?: string
  name?: string
  isActive?: boolean
}

interface TopicMockOptions extends DisciplineMockOptions {
  topicId?: string
  topicParentId?: string
  topicRootId?: string
  depth?: number
}

export const disciplineMockState = (options: DisciplineMockOptions = {}): DisciplineState => {
  const disciplineId = options.disciplineId || faker.string.uuid()
  const createdAt = faker.date.recent()
  return {
    disciplineId,
    name: options.name || "Discipline " + disciplineId,
    topics: [],
    image: "Base64 ou URL da image",
    isActive: options.isActive !== undefined ? options.isActive : true,
    createdAt: createdAt,
    updatedAt: null,
  }
}

export const topicMockState = (options: TopicMockOptions = {}): TopicState => {
  const topicId = options.topicId || faker.string.uuid()
  const disciplineId = options.disciplineId || faker.string.uuid()
  const createdAt = faker.date.recent()
  return {
    topicId,
    disciplineId,
    name: options.name || "Topic " + topicId,
    isTopicClassify: false,
    topicParentId: options.topicParentId || null,
    topicRootId: options.topicRootId || topicId,
    depth: options.depth || 1,
    dependencies: [],
    obs: "",
    isActive: options.isActive !== undefined ? options.isActive : true,
    createdAt: createdAt,
    updatedAt: null,
  }
}

export const disciplineMock = (options: DisciplineMockOptions = {}): Discipline => {
  const disciplineState = disciplineMockState(options)
  return Discipline.toDomain(disciplineState)
}

export const topicMock = (options: TopicMockOptions = {}): Topic => {
  const topic = Topic.toDomain(topicMockState(options))
  topic.setDepth(1)
  return topic
}

export const disciplineState = (discipline: Discipline): DisciplineState => {
  return {
    disciplineId: discipline.id,
    name: discipline.name,
    image: discipline.image,
    topics: discipline.topics.toDTO(),
    isActive: discipline.isActive,
    createdAt: discipline.createdAt.value,
    updatedAt: discipline.updatedAt?.value || null,
  }
}
