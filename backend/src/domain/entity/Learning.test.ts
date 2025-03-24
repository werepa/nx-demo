import { faker } from "@faker-js/faker"
import { disciplineMock, topicMock, userMock } from "../../tests/mocks"
import { Discipline, Learning, User, TopicLearningList, QuizAnswerList, QuizAnswer, Topic, TopicLearning } from "."
import { DateBr } from "../../shared/domain/valueObject"
import { LearningDTO } from "@simulex/models"

describe("Entity => Learning", () => {
  let user: User
  let discipline: Discipline
  let topic1: Topic
  let topic2: Topic
  let topic3: Topic

  beforeEach(() => {
    user = userMock()
    discipline = disciplineMock()
    topic1 = topicMock({ name: "Topic1" })
    topic2 = topicMock({ name: "Topic2" })
    topic3 = topicMock({ name: "Topic3" })
    discipline.topics.add(topic1)
    discipline.topics.add(topic2)
    discipline.topics.add(topic3)
    discipline.setTopicParent({ topic: topic2, topicParent: topic1 })
    discipline.setTopicParent({ topic: topic3, topicParent: topic1 })
  })

  describe("Learning properties", () => {
    it("should have correct properties", () => {
      const learning = Learning.create({ user, discipline })
      expect(learning.learningId).toBeDefined()
      expect(learning.user).toEqual(user)
      expect(learning.discipline).toEqual(discipline)
      expect(learning.topics).toBeInstanceOf(TopicLearningList)
      expect(learning.topics.getCount()).toBe(discipline.topics.getCount())
      expect(learning.history).toBeInstanceOf(QuizAnswerList)
      expect(learning.history.getCount()).toBe(0)

      const correctOptionId = faker.string.uuid()
      const userQuizAnswer1 = QuizAnswer.create({
        quizId: faker.string.uuid(),
        questionId: faker.string.uuid(),
        topicId: topic1.topicId,
        correctOptionId,
        userOptionId: correctOptionId,
        isUserAnswerCorrect: true,
      })

      const quizAnswer2 = QuizAnswer.create({
        quizId: faker.string.uuid(),
        questionId: faker.string.uuid(),
        topicId: topic2.topicId,
        correctOptionId,
        userOptionId: faker.string.uuid(),
        isUserAnswerCorrect: false,
      })
      learning.history.add(userQuizAnswer1)
      learning.history.add(quizAnswer2)
      expect(learning.history.getCount()).toBe(2)
      expect(learning.topics.findByTopicId(topic1.topicId)?.history.getCount()).toBe(1)
    })
  })

  describe("history", () => {
    let user: User
    let discipline: Discipline
    let topic1: Topic
    let topic2: Topic
    let topic3: Topic
    let topic4: Topic
    let learning: Learning
    let topicLearning1: TopicLearning
    let topicLearning2: TopicLearning
    let topicLearning3: TopicLearning
    let topicLearning4: TopicLearning

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
      discipline.setTopicParent({ topic: topic2, topicParent: topic1 })
      discipline.setTopicParent({ topic: topic3, topicParent: topic1 })
      discipline.setTopicParent({ topic: topic4, topicParent: topic2 })
      learning = Learning.create({ user, discipline })
      topicLearning1 = learning.topics.findByTopicId(topic1.topicId)
      topicLearning2 = learning.topics.findByTopicId(topic2.topicId)
      topicLearning3 = learning.topics.findByTopicId(topic3.topicId)
      topicLearning4 = learning.topics.findByTopicId(topic4.topicId)
    })

    const createHistory = async (keys: number[], topicLearning: TopicLearning = topicLearning1): Promise<number | null> => {
      if (!topicLearning) return null

      topicLearning.history.clear()
      for (const key of keys) {
        const correctOptionId = faker.string.uuid()
        topicLearning.parent.history.add(
          QuizAnswer.toDomain({
            quizAnswerId: faker.string.uuid(),
            quizId: faker.string.uuid(),
            topicId: topicLearning.topic.topicId,
            questionId: faker.string.uuid(),
            correctOptionId,
            userOptionId: key === 1 ? correctOptionId : faker.string.uuid(),
            isUserAnswerCorrect: key === 1 ? true : false,
            canRepeat: false,
            createdAt: DateBr.create().value,
          })
        )
      }
      return topicLearning.learning()
    }

    it("should return the history of a topic", async () => {
      await createHistory([1, 0, 1, 0, 1], topicLearning1)
      const history = topicLearning1?.history.getItems() ?? []
      expect(history).toHaveLength(5)
      expect(history[0].isUserAnswerCorrect).toBe(true)
      expect(history[1].isUserAnswerCorrect).toBe(false)
      expect(history[2].isUserAnswerCorrect).toBe(true)
      expect(history[3].isUserAnswerCorrect).toBe(false)
      expect(history[4].isUserAnswerCorrect).toBe(true)
    })

    it("should return the history of a topic with a limit", async () => {
      await createHistory([0, 0, 1], topicLearning1)
      let history = topicLearning1?.history.getShortHistory(2) ?? []
      expect(history).toHaveLength(2)
      expect(history[0].isUserAnswerCorrect).toBe(false)
      expect(history[1].isUserAnswerCorrect).toBe(true)

      history = topicLearning1?.history.getShortHistory(5) ?? []
      expect(history).toHaveLength(3)
      expect(history[0].isUserAnswerCorrect).toBe(false)
      expect(history[1].isUserAnswerCorrect).toBe(false)
      expect(history[2].isUserAnswerCorrect).toBe(true)

      await createHistory([0, 0, 1, 1, 1, 0, 1, 0], topicLearning1)
      history = topicLearning1?.history.getShortHistory() ?? []
      expect(history).toHaveLength(5)
      expect(history[0].isUserAnswerCorrect).toBe(true)
      expect(history[1].isUserAnswerCorrect).toBe(true)
      expect(history[2].isUserAnswerCorrect).toBe(false)
      expect(history[3].isUserAnswerCorrect).toBe(true)
      expect(history[4].isUserAnswerCorrect).toBe(false)
    })

    it("should return children of a topicLearning", async () => {
      const childrenTopic1 = topicLearning1 ? learning.topics.topicsChildren(topicLearning1) : []
      expect(childrenTopic1).toHaveLength(2)
      expect(childrenTopic1[0].topic.name).toBe("Topic2")
      expect(childrenTopic1[1].topic.name).toBe("Topic3")

      const childrenTopic2 = topicLearning2 ? learning.topics.topicsChildren(topicLearning2) : []
      expect(childrenTopic2).toHaveLength(1)
      expect(childrenTopic2[0].topic.name).toBe("Topic4")
    })

    it("should return children of a topicLearning recursively", async () => {
      const childrenRecursiveTopic1 = topicLearning1 ? learning.topics.topicsChildrenRecursive(topicLearning1) : []
      expect(childrenRecursiveTopic1).toHaveLength(3)
      expect(childrenRecursiveTopic1[0].topic.name).toBe("Topic2")
      expect(childrenRecursiveTopic1[1].topic.name).toBe("Topic3")
      expect(childrenRecursiveTopic1[2].topic.name).toBe("Topic4")

      const childrenTopic2 = topicLearning2 ? learning.topics.topicsChildrenRecursive(topicLearning2) : []
      expect(childrenTopic2).toHaveLength(1)
      expect(childrenTopic2[0].topic.name).toBe("Topic4")
    })

    // 0 a 7 (0: não verificado, 1: em análise, 2: iniciante, 3: leigo, 4: aprendiz, 5: bacharel, 6: mestre, 7: doutor)
    it("shoud calculate learning recursively", async () => {
      expect(await createHistory([1, 1], topicLearning1)).toBe(5)
      expect(await createHistory([0, 0, 1, 1, 0], topicLearning2)).toBe(3)
      expect(await createHistory([0], topicLearning3)).toBe(1)
      expect(await createHistory([0, 0, 0], topicLearning4)).toBe(2)

      expect(learning.topics.getCount()).toBe(4)
      expect(learning.topics.findByTopicId(topic1.topicId)?.learning()).toBe(5)
      expect(learning.topics.findByTopicId(topic1.topicId)?.learningLabel()).toBe("Bacharel")
      expect(learning.topics.findByTopicId(topic2.topicId)?.learning()).toBe(3)
      expect(learning.topics.findByTopicId(topic2.topicId)?.learningLabel()).toBe("Leigo")
      expect(learning.topics.findByTopicId(topic1.topicId)?.learningRecursive()).toBe(3)
      expect(learning.topics.findByTopicId(topic1.topicId)?.learningRecursiveLabel()).toBe("Leigo")
      expect(learning.topics.findByTopicId(topic2.topicId)?.learningRecursive()).toBe(2)
      expect(learning.topics.findByTopicId(topic2.topicId)?.learningRecursiveLabel()).toBe("Iniciante")
    })

    it("should correctly convert Learning to LearningDTO", () => {
      const learningDTO: LearningDTO = learning.toDTO()
      const expectedResult: LearningDTO = {
        learningId: learning.learningId,
        discipline: discipline.toDTO(),
        user: user.toDTO(),
        topics: learning.topics.toDTO(),
        history: [],
      }
      expect(learningDTO.discipline).toEqual(expectedResult.discipline)
      expect(learningDTO.user).toEqual(expectedResult.user)
      expect(learningDTO.topics).toEqual(expectedResult.topics)
      expect(learningDTO.history).toEqual(expectedResult.history)
      expect(learningDTO.learningId).toEqual(expectedResult.learningId)
      expect(learningDTO.topics[0].topic).toEqual(expectedResult.topics[0].topic)
    })
  })
})
