import { Discipline, Learning, Topic, TopicLearning, User } from "."
import { disciplineMock, topicMock } from "../../tests/mocks/disciplineMock"
import { userMock } from "../../tests/mocks"
import { TopicLearningList } from "./TopicLearningList"

describe("TopicLearningList", () => {
  let user: User
  let portugues: Discipline
  let crase: Topic
  let palavrasEspeciais: Topic
  let antesVerbo: Topic
  let distancia: Topic
  let learning: Learning
  let topicLearningCrase: TopicLearning
  let topicLearningPalavrasEspeciais: TopicLearning
  let topicLearningAntesVerbo: TopicLearning
  let topicLearningDistancia: TopicLearning
  let topicLearningList: TopicLearningList

  beforeEach(() => {
    user = userMock()
    portugues = disciplineMock({ name: "Português" })
    crase = topicMock({ name: "Crase" })
    palavrasEspeciais = topicMock({ name: "Palavras especiais" })
    antesVerbo = topicMock({ name: "Antes de verbo" })
    distancia = topicMock({ name: "Distância" })

    portugues.topics.add(crase)
    portugues.topics.add(palavrasEspeciais)
    portugues.topics.add(antesVerbo)
    portugues.topics.add(distancia)

    // Set up hierarchy: Crase -> (Palavras especiais, Antes de verbo), Palavras especiais -> Distância
    portugues.setTopicParent({ topic: palavrasEspeciais, topicParent: crase })
    portugues.setTopicParent({ topic: antesVerbo, topicParent: crase })
    portugues.setTopicParent({ topic: distancia, topicParent: palavrasEspeciais })

    learning = Learning.create({ user, discipline: portugues })

    topicLearningCrase = TopicLearning.create({
      topic: crase,
      userId: user.userId,
      parent: learning,
    })
    topicLearningPalavrasEspeciais = TopicLearning.create({
      topic: palavrasEspeciais,
      userId: user.userId,
      parent: learning,
    })
    topicLearningAntesVerbo = TopicLearning.create({
      topic: antesVerbo,
      userId: user.userId,
      parent: learning,
    })
    topicLearningDistancia = TopicLearning.create({
      topic: distancia,
      userId: user.userId,
      parent: learning,
    })

    topicLearningList = TopicLearningList.create(user.userId, [
      topicLearningCrase,
      topicLearningPalavrasEspeciais,
      topicLearningAntesVerbo,
      topicLearningDistancia,
    ])
  })

  describe("create", () => {
    it("should throw error when user ID mismatches", () => {
      const differentUser = userMock()
      expect(() => TopicLearningList.create(differentUser.userId, [topicLearningCrase])).toThrow("User ID mismatch")
    })
  })

  describe("add", () => {
    it("should throw error when trying to add duplicate topic learning", () => {
      expect(() => topicLearningList.add(topicLearningCrase)).toThrow("TopicLearning ID")
    })

    it("should throw error when trying to add topic learning with different user", () => {
      const differentUser = userMock()
      const newTopicLearning = TopicLearning.create({
        topic: topicMock(),
        userId: differentUser.userId,
        parent: learning,
      })
      expect(() => topicLearningList.add(newTopicLearning)).toThrow("User not matches with userId")
    })

    it("should add new topic learning successfully", () => {
      const newTopic = topicMock({ name: "NewTopic" })
      const newTopicLearning = TopicLearning.create({
        topic: newTopic,
        userId: user.userId,
        parent: learning,
      })
      topicLearningList.add(newTopicLearning)
      expect(topicLearningList.getItems()).toContain(newTopicLearning)
    })
  })

  describe("findByTopicId", () => {
    it("should throw error when topic ID is not provided", () => {
      expect(() => topicLearningList.findByTopicId("")).toThrow("Topic ID is required")
    })

    it("should return null when topic is not found", () => {
      expect(topicLearningList.findByTopicId("non-existent-id")).toBeNull()
    })

    it("should find topic learning by topic ID", () => {
      expect(topicLearningList.findByTopicId(crase.topicId)).toBe(topicLearningCrase)
    })
  })

  describe("getItems", () => {
    it("should return items sorted by topic depth and name", () => {
      const items = topicLearningList.getItems()
      expect(items.map((item) => item.topic.name)).toEqual(["Crase", "Antes de verbo", "Palavras especiais", "Distância"])
    })

    it("should handle special characters in topic names when sorting", () => {
      const topicÁ = topicMock({ name: "Tópicó Á" })
      const topicLearningA = TopicLearning.create({
        topic: topicÁ,
        userId: user.userId,
        parent: learning,
      })
      topicLearningList.add(topicLearningA)

      const items = topicLearningList.getItems()
      expect(items.map((item) => item.topic.name)).toContain("Tópicó Á")
    })
  })

  describe("topicsChildren", () => {
    it("should return direct children of a topic", () => {
      const children = topicLearningList.topicsChildren(topicLearningCrase)
      expect(children).toHaveLength(2)
      expect(children).toContain(topicLearningPalavrasEspeciais)
      expect(children).toContain(topicLearningAntesVerbo)
      expect(children).not.toContain(topicLearningDistancia)
    })

    it("should return empty array for topic without children", () => {
      const children = topicLearningList.topicsChildren(topicLearningDistancia)
      expect(children).toHaveLength(0)
    })
  })

  describe("topicsChildrenRecursive", () => {
    it("should return all descendants of a topic", () => {
      const descendants = topicLearningList.topicsChildrenRecursive(topicLearningCrase)
      expect(descendants).toHaveLength(3)
      expect(descendants).toContain(topicLearningPalavrasEspeciais)
      expect(descendants).toContain(topicLearningAntesVerbo)
      expect(descendants).toContain(topicLearningDistancia)
    })

    it("should return descendants sorted by name", () => {
      const descendants = topicLearningList.topicsChildrenRecursive(topicLearningCrase)
      const names = descendants.map((d) => d.topic.name)
      expect(names).toEqual(["Antes de verbo", "Distância", "Palavras especiais"])
    })

    it("should return empty array for topic without descendants", () => {
      const descendants = topicLearningList.topicsChildrenRecursive(topicLearningDistancia)
      expect(descendants).toHaveLength(0)
    })
  })

  describe("toDTO", () => {
    it("should convert TopicLearningList to DTO array, order by depth and name", () => {
      const dto = topicLearningList.toDTO()

      expect(dto).toHaveLength(4)
      expect(dto).toEqual([
        topicLearningCrase.toDTO(),
        topicLearningAntesVerbo.toDTO(),
        topicLearningPalavrasEspeciais.toDTO(),
        topicLearningDistancia.toDTO(),
      ])
    })
  })
})
