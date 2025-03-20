import { DateBr } from "../../shared/domain/valueObject"
import { topicMockFromPersistence } from "../../tests/mocks"
import { Topic } from "."
import { TopicFromPersistence } from "../../shared/models"
import { TopicDTO } from "@simulex/models"

describe("Entity => Topic", () => {
  it("should create an instance of Topic with valid properties", () => {
    const props = {
      name: "Pronomes",
      disciplineId: "1",
      createdAt: "2022-01-01",
      updatedAt: "2022-01-02",
    }
    const pronomes = Topic.create(props)
    expect(pronomes).toBeInstanceOf(Topic)
    expect(pronomes.topicId).toHaveLength(36)
    expect(pronomes.name).toBe("Pronomes")
    expect(pronomes.createdAt).toBeInstanceOf(DateBr)
    expect(pronomes.updatedAt).toBeNull()
    expect(pronomes.isActive).toBeTruthy()

    const crase = Topic.create({ name: "Crase" })
    expect(crase).toBeInstanceOf(Topic)
    expect(crase.topicId).toHaveLength(36)
  })

  it("should change the name of a Topic", () => {
    const proname = Topic.create({ name: "Pronomes" })
    proname.updateName("Alterado")
    expect(proname.name).toBe("Alterado")
    const classificar = Topic.create({ name: "A classificar" })
    classificar.setIsTopicClassify(true)
    expect(() => classificar.updateName("Alterado")).toThrow(
      `Cannot change the name of the topic "A classificar"`,
    )
  })

  it("should not deactivate the Topic 'A classificar'", async () => {
    const classificar = Topic.create({ name: "A classificar" })
    classificar.setIsTopicClassify(true)
    expect(() => classificar.deactivate()).toThrow(
      `Cannot deactivate the topic "A classificar"`,
    )
    expect(classificar.isActive).toBeTruthy()
  })

  it("should create an instance of Topic with persistence data", () => {
    const topicFromPersistence: TopicFromPersistence =
      topicMockFromPersistence()
    const topic = Topic.toDomain(topicFromPersistence)
    expect(topic).toBeInstanceOf(Topic)
    expect(topic.topicId).toBe(topicFromPersistence.topicId)
    expect(topic.name).toBe(topicFromPersistence.name)
    expect(topic.disciplineId).toBe(topicFromPersistence.disciplineId)
    expect(topic.isActive).toBe(topicFromPersistence.isActive)
    expect(topic.createdAt).toBeInstanceOf(DateBr)
    expect(topic.updatedAt).toBeNull()
  })

  it("should throw an error when creating an instance without the required properties", () => {
    // @ts-expect-error - Testing the validation of the required properties
    expect(() => Topic.create({})).toThrow(
      "Topic - Missing required property: name",
    )
  })

  it("should convert a Topic instance to a DTO object", () => {
    const proname = Topic.create({ name: "Pronomes" })
    const topicDTO: TopicDTO = proname.toDTO()
    expect(topicDTO.topicId).toBe(proname.topicId)
    expect(topicDTO.name).toBe(proname.name)
    expect(topicDTO.disciplineId).toBe(proname.disciplineId)
    expect(topicDTO.isActive).toBe(proname.isActive)
    expect(topicDTO.createdAt).toBe(proname.createdAt.formatoBr)
    expect(topicDTO.updatedAt).toBeNull()
  })

  it("should convert a persistence object to a Topic instance", () => {
    const topicFromPersistence: TopicFromPersistence =
      topicMockFromPersistence()
    const topic = Topic.toDomain(topicFromPersistence)
    expect(topic.topicId).toBe(topicFromPersistence.topicId)
    expect(topic.name).toBe(topicFromPersistence.name)
    expect(topic.disciplineId).toBe(topicFromPersistence.disciplineId)
    expect(topic.isActive).toBe(topicFromPersistence.isActive)
    expect(topic.createdAt.value).toBe(topicFromPersistence.createdAt)
    expect(topic.updatedAt).toBeNull()
  })
})
