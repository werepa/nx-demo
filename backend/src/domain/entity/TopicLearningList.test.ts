import { Learning, TopicLearning } from "."
import { disciplineMock, topicMock } from "../../tests/mocks/disciplineMock"
import { userMock } from "../../tests/mocks"
import { TopicLearningList } from "./TopicLearningList"

describe("TopicLearningList", () => {
  let user: any
  let discipline: any
  let topic1: any
  let topic2: any
  let topic3: any
  let topic4: any
  let learning: any
  let topicLearning1: TopicLearning
  let topicLearning2: TopicLearning
  let topicLearning3: TopicLearning
  let topicLearning4: TopicLearning
  let topicLearningList: TopicLearningList

  beforeEach(() => {
    user = userMock()
    discipline = disciplineMock()
    topic1 = topicMock({ name: "Topic1" })
    topic2 = topicMock({ name: "Topic2" })
    topic3 = topicMock({ name: "Topic3" })
    topic4 = topicMock({ name: "Topic4" })

    discipline.topics.add(topic1)
    discipline.topics.add(topic2)
    discipline.topics.add(topic3)
    discipline.topics.add(topic4)

    // Set up hierarchy: Topic1 -> (Topic2, Topic3), Topic2 -> Topic4
    discipline.setTopicParent({ topic: topic2, topicParent: topic1 })
    discipline.setTopicParent({ topic: topic3, topicParent: topic1 })
    discipline.setTopicParent({ topic: topic4, topicParent: topic2 })

    learning = Learning.create({ user, discipline })

    topicLearning1 = TopicLearning.create({
      topic: topic1,
      userId: user.userId,
      parent: learning,
    })
    topicLearning2 = TopicLearning.create({
      topic: topic2,
      userId: user.userId,
      parent: learning,
    })
    topicLearning3 = TopicLearning.create({
      topic: topic3,
      userId: user.userId,
      parent: learning,
    })
    topicLearning4 = TopicLearning.create({
      topic: topic4,
      userId: user.userId,
      parent: learning,
    })

    topicLearningList = TopicLearningList.create(user.userId, [
      topicLearning1,
      topicLearning2,
      topicLearning3,
      topicLearning4,
    ])
  })

  describe("create", () => {
    it("should throw error when user ID mismatches", () => {
      const differentUser = userMock()
      expect(() =>
        TopicLearningList.create(differentUser.userId, [topicLearning1]),
      ).toThrow("User ID mismatch")
    })
  })

  describe("add", () => {
    it("should throw error when trying to add duplicate topic learning", () => {
      expect(() => topicLearningList.add(topicLearning1)).toThrow(
        "TopicLearning ID",
      )
    })

    it("should throw error when trying to add topic learning with different user", () => {
      const differentUser = userMock()
      const newTopicLearning = TopicLearning.create({
        topic: topicMock(),
        userId: differentUser.userId,
        parent: learning,
      })
      expect(() => topicLearningList.add(newTopicLearning)).toThrow(
        "User not matches with userId",
      )
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
      expect(() => topicLearningList.findByTopicId("")).toThrow(
        "Topic ID is required",
      )
    })

    it("should return null when topic is not found", () => {
      expect(topicLearningList.findByTopicId("non-existent-id")).toBeNull()
    })

    it("should find topic learning by topic ID", () => {
      expect(topicLearningList.findByTopicId(topic1.topicId)).toBe(
        topicLearning1,
      )
    })
  })

  describe("getItems", () => {
    it("should return items sorted by topic name", () => {
      const items = topicLearningList.getItems()
      expect(items.map((item) => item.topic.name)).toEqual([
        "Topic1",
        "Topic2",
        "Topic3",
        "Topic4",
      ])
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
      const children = topicLearningList.topicsChildren(topicLearning1)
      expect(children).toHaveLength(2)
      expect(children).toContain(topicLearning2)
      expect(children).toContain(topicLearning3)
      expect(children).not.toContain(topicLearning4)
    })

    it("should return empty array for topic without children", () => {
      const children = topicLearningList.topicsChildren(topicLearning4)
      expect(children).toHaveLength(0)
    })
  })

  describe("topicsChildrenRecursive", () => {
    it("should return all descendants of a topic", () => {
      const descendants =
        topicLearningList.topicsChildrenRecursive(topicLearning1)
      expect(descendants).toHaveLength(3)
      expect(descendants).toContain(topicLearning2)
      expect(descendants).toContain(topicLearning3)
      expect(descendants).toContain(topicLearning4)
    })

    it("should return descendants sorted by name", () => {
      const descendants =
        topicLearningList.topicsChildrenRecursive(topicLearning1)
      const names = descendants.map((d) => d.topic.name)
      expect(names).toEqual(["Topic2", "Topic3", "Topic4"])
    })

    it("should return empty array for topic without descendants", () => {
      const descendants =
        topicLearningList.topicsChildrenRecursive(topicLearning4)
      expect(descendants).toHaveLength(0)
    })
  })

  describe("toDTO", () => {
    it("should convert TopicLearningList to DTO array", () => {
      const dto = topicLearningList.toDTO()

      expect(dto).toHaveLength(4)
      expect(dto).toEqual([
        topicLearning1.toDTO(),
        topicLearning2.toDTO(),
        topicLearning3.toDTO(),
        topicLearning4.toDTO(),
      ])
    })
  })
})
