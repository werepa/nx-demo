import { faker } from "@faker-js/faker"
import { Discipline, Topic } from "../../domain/entity"
import { DisciplineDTO, TopicDTO } from "@simulex/models"

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

export const disciplineMockFromPersistence = (options: DisciplineMockOptions = {}): DisciplineDTO => {
  const disciplineId = options.disciplineId || faker.string.uuid()
  const createdAt = faker.date.recent()
  return {
    disciplineId,
    name: options.name || "Discipline " + disciplineId,
    topics: [],
    image: "Base64 ou URL da image",
    isActive: options.isActive !== undefined ? options.isActive : true,
    createdAt: createdAt.toISOString(),
    updatedAt: "",
  }
}

export const topicMockFromPersistence = (options: TopicMockOptions = {}): TopicDTO => {
  const topicId = options.topicId || faker.string.uuid()
  const disciplineId = options.disciplineId || faker.string.uuid()
  const createdAt = faker.date.recent()
  return {
    topicId,
    disciplineId,
    name: options.name || "Topic " + topicId,
    isTopicClassify: false,
    topicParentId: options.topicParentId || topicId,
    topicRootId: options.topicRootId || topicId,
    depth: options.depth || 1,
    dependencies: [],
    obs: "",
    isActive: options.isActive !== undefined ? options.isActive : true,
    createdAt: createdAt.toISOString(),
    updatedAt: null,
  }
}

export const disciplineMock = (options: DisciplineMockOptions = {}): Discipline => {
  const disciplineDTO = disciplineMockFromPersistence(options)
  return Discipline.toDomain(disciplineDTO)
}

export const topicMock = (options: TopicMockOptions = {}): Topic => {
  const topic = Topic.toDomain(topicMockFromPersistence(options))
  topic.setDepth(1)
  return topic
}

export const disciplineFromPersistence = (discipline: Discipline): DisciplineDTO => {
  return {
    disciplineId: discipline.id,
    name: discipline.name,
    image: discipline.image,
    topics: discipline.topics.toDTO(),
    isActive: discipline.isActive,
    createdAt: discipline.createdAt.formatoBr,
    updatedAt: discipline.updatedAt?.formatoBr || "",
  }
}
