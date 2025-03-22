import { DateBr } from "../../shared/domain/valueObject/DateBr"
import { Discipline, Learning, QuizAnswer, Topic, TopicLearning, User } from "."
import { disciplineMock, topicMock } from "../../tests/mocks/disciplineMock"
import { userMock } from "../../tests/mocks"
import { faker } from "@faker-js/faker"
import { TopicLearningDTO } from "@simulex/models"

describe("TopicLearning", () => {
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
  })

  const createHistory = (keys: number[], subtractDays = 0, topicLearning: TopicLearning = topicLearning1): number => {
    topicLearning.parent.history.clear()
    const lastDate = DateBr.create().subtractDays(subtractDays)
    let counter = keys.length
    for (const key of keys) {
      counter--
      const correctOptionId = faker.string.uuid()
      topicLearning.parent.history.add(
        QuizAnswer.toDomain({
          quizAnswerId: faker.string.uuid(),
          quizId: faker.string.uuid(),
          topicId: topicLearning.topic.topicId,
          questionId: faker.string.uuid(),
          correctOptionId,
          userOptionId: key === 1 ? faker.string.uuid() : faker.string.uuid(),
          isUserAnswerCorrect: key === 1 ? true : false,
          canRepeat: false,
          createdAt: DateBr.create(lastDate).subtractDays(counter).value,
        })
      )
    }
    return topicLearning.learning()
  }

  describe("forgettingRate", () => {
    it("should return the score if reach deadline or zero if deadline is in the future", async () => {
      expect(topicLearning1.updatedAt()).toBeNull()
      expect(topicLearning1.forgettingRate()).toBe(0)

      // waittingTime = 1
      createHistory([1])
      expect(topicLearning1.score()).toBe(1)
      expect(topicLearning1.forgettingRate()).toBe(0)

      topicLearning1.setCollectiveAvgGrade(70)
      expect(topicLearning1.forgettingRate()).toBe(0)

      expect(topicLearning1.forgettingRate()).toBe(0)

      createHistory([1], 1)
      expect(topicLearning1.forgettingRate()).toBe(1)

      // waittingTime = 2
      createHistory([1, 1], 1)
      expect(topicLearning1.forgettingRate()).toBe(0)

      createHistory([1, 1], 2)
      expect(topicLearning1.forgettingRate()).toBe(2)

      // waittingTime = 5
      createHistory([1, 1, 1], 1)
      expect(topicLearning1.forgettingRate()).toBe(0)

      createHistory([1, 1, 1], 2)
      expect(topicLearning1.forgettingRate()).toBe(0)

      createHistory([1, 1, 1], 4)
      expect(topicLearning1.forgettingRate()).toBe(0)

      createHistory([1, 1, 1], 5)
      expect(topicLearning1.forgettingRate()).toBe(3)

      // waittingTime = 13
      createHistory([1, 1, 1, 1], 1)
      expect(topicLearning1.forgettingRate()).toBe(0)
    })
  })

  describe("classifyLearning", () => {
    // 0 a 7 (0: não verificado, 1: em análise, 2: iniciante, 3: leigo, 4: aprendiz, 5: bacharel, 6: mestre, 7: doutor)
    it("shoud calculate learning", async () => {
      expect(createHistory([])).toBe(0) // 0: não verificado
      expect(createHistory([0])).toBe(1) // 1: em análise
      expect(createHistory([1])).toBe(1) // 1: em análise
      expect(createHistory([0, 0])).toBe(2) // 2: iniciante
      expect(createHistory([0, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 0])).toBe(3) // 3: leigo
      expect(createHistory([1, 1])).toBe(5) // 5: bacharel
      expect(createHistory([0, 0, 0])).toBe(2) // 2: iniciante
      expect(createHistory([0, 0, 1])).toBe(3) // 3: leigo
      expect(createHistory([0, 1, 0])).toBe(3) // 3: leigo
      expect(createHistory([0, 1, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 0, 0])).toBe(3) // 3: leigo
      expect(createHistory([1, 0, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 1, 0])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 1, 1])).toBe(6) // 6: mestre
      expect(createHistory([0, 0, 0, 0])).toBe(2) // 2: iniciante
      expect(createHistory([0, 0, 0, 1])).toBe(3) // 3: leigo
      expect(createHistory([0, 0, 1, 0])).toBe(3) // 3: leigo
      expect(createHistory([0, 0, 1, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([0, 1, 0, 0])).toBe(3) // 3: leigo
      expect(createHistory([0, 1, 0, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([0, 1, 1, 0])).toBe(4) // 4: aprendiz
      expect(createHistory([0, 1, 1, 1])).toBe(5) // 5: bacharel
      expect(createHistory([1, 0, 0, 0])).toBe(3) // 3: leigo
      expect(createHistory([1, 0, 0, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 0, 1, 0])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 0, 1, 1])).toBe(5) // 5: bacharel
      expect(createHistory([1, 1, 0, 0])).toBe(3) // 3: leigo
      expect(createHistory([1, 1, 0, 1])).toBe(5) // 5: bacharel
      expect(createHistory([1, 1, 1, 0])).toBe(5) // 5: bacharel
      expect(createHistory([1, 1, 1, 1])).toBe(6) // 6: mestre
      expect(createHistory([0, 0, 0, 0, 0])).toBe(2) // 2: iniciante
      expect(createHistory([0, 0, 0, 0, 1])).toBe(3) // 3: leigo
      expect(createHistory([0, 0, 0, 1, 0])).toBe(3) // 3: leigo
      expect(createHistory([0, 0, 0, 1, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([0, 0, 1, 0, 0])).toBe(3) // 3: leigo
      expect(createHistory([0, 0, 1, 0, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([0, 0, 1, 1, 0])).toBe(3) // 3: leigo
      expect(createHistory([0, 0, 1, 1, 1])).toBe(5) // 5: bacharel
      expect(createHistory([0, 1, 0, 0, 0])).toBe(3) // 3: leigo
      expect(createHistory([0, 1, 0, 0, 1])).toBe(3) // 3: leigo
      expect(createHistory([0, 1, 0, 1, 0])).toBe(3) // 3: leigo
      expect(createHistory([0, 1, 0, 1, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([0, 1, 1, 0, 0])).toBe(3) // 3: leigo
      expect(createHistory([0, 1, 1, 0, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([0, 1, 1, 1, 0])).toBe(4) // 4: aprendiz
      expect(createHistory([0, 1, 1, 1, 1])).toBe(6) // 6: mestre
      expect(createHistory([1, 0, 0, 0, 0])).toBe(2) // 2: iniciante
      expect(createHistory([1, 0, 0, 0, 1])).toBe(3) // 3: leigo
      expect(createHistory([1, 0, 0, 1, 0])).toBe(3) // 3: leigo
      expect(createHistory([1, 0, 0, 1, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 0, 1, 0, 0])).toBe(3) // 3: leigo
      expect(createHistory([1, 0, 1, 0, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 0, 1, 1, 0])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 0, 1, 1, 1])).toBe(6) // 6: mestre
      expect(createHistory([1, 1, 0, 0, 0])).toBe(3) // 3: leigo
      expect(createHistory([1, 1, 0, 0, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 1, 0, 1, 0])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 1, 0, 1, 1])).toBe(5) // 5: bacharel
      expect(createHistory([1, 1, 1, 0, 0])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 1, 1, 0, 1])).toBe(5) // 5: bacharel
      expect(createHistory([1, 1, 1, 1, 0])).toBe(5) // 5: bacharel
      expect(createHistory([1, 1, 1, 1, 1])).toBe(7) // 7: doutor

      expect(createHistory([1, 1, 0, 0, 0, 0])).toBe(2) // 2: iniciante
      expect(createHistory([1, 1, 1, 0, 0, 0])).toBe(3) // 3: leigo
      expect(createHistory([1, 1, 1, 0, 0, 1])).toBe(4) // 4: aprendiz
      expect(createHistory([1, 1, 1, 1, 1, 0])).toBe(5) // 5: bacharel
      expect(createHistory([1, 1, 0, 1, 1, 1])).toBe(6) // 6: mestre
      expect(createHistory([1, 1, 1, 1, 1, 1])).toBe(7) // 7: doutor
    })
  })

  describe("toDTO", () => {
    it("should convert TopicLearning to DTO", () => {
      createHistory([1, 1, 1]) // Set learning level to 6 (mestre)
      topicLearning1.setCollectiveAvgGrade(85)

      const dto: TopicLearningDTO = topicLearning1.toDTO()

      const expectResult: TopicLearningDTO = {
        topicLearningId: topicLearning1.topicLearningId,
        userId: user.userId,
        topic: topic1.toDTO(),
        score: 3,
        levelInTopic: 50,
        learning: 6,
        learningLabel: "Mestre",
        learningSource: 1,
        learningSourceLabel: "Pré-existente",
        qtyQuestions: 0,
        qtyQuestionsRecursive: 0,
        qtyAllQuestionsDepth: 0,
        maxQtyAllQuestionsDepth: 0,
        maxQtyAllQuestionsRootRecursive: 0,
        frequencyInDepth: 0,
        frequencyInDiscipline: 0,
        difficultyRecursive: 50,
        collectiveAvgGrade: 85,
        collectiveAvgScore: 0,
        qtyQuestionsAnswered: 3,
        qtyQuestionsCorrectAnswered: 3,
        isLastQuestionCorrectAnswered: true,
        avgGrade: 100,
        srs: 17.2,
        history: topicLearning1.history.getItems().map((item) => item.toDTO()),
      }
      expect(dto.topicLearningId).toEqual(expectResult.topicLearningId)
      expect(dto.userId).toEqual(expectResult.userId)
      expect(dto.topic).toEqual(expectResult.topic)
      expect(dto.score).toEqual(expectResult.score)
      expect(dto.levelInTopic).toEqual(expectResult.levelInTopic)
      expect(dto.learning).toEqual(expectResult.learning)
      expect(dto.learningLabel).toEqual(expectResult.learningLabel)
      expect(dto.learningSource).toEqual(expectResult.learningSource)
      expect(dto.learningSourceLabel).toEqual(expectResult.learningSourceLabel)
      expect(dto.qtyQuestions).toEqual(expectResult.qtyQuestions)
      expect(dto.qtyQuestionsRecursive).toEqual(expectResult.qtyQuestionsRecursive)
      expect(dto.qtyAllQuestionsDepth).toEqual(expectResult.qtyAllQuestionsDepth)
      expect(dto.maxQtyAllQuestionsDepth).toEqual(expectResult.maxQtyAllQuestionsDepth)
      expect(dto.maxQtyAllQuestionsRootRecursive).toEqual(expectResult.maxQtyAllQuestionsRootRecursive)
      expect(dto.frequencyInDepth).toEqual(expectResult.frequencyInDepth)
      expect(dto.frequencyInDiscipline).toEqual(expectResult.frequencyInDiscipline)
      expect(dto.difficultyRecursive).toEqual(expectResult.difficultyRecursive)
      expect(dto.collectiveAvgGrade).toEqual(expectResult.collectiveAvgGrade)
      expect(dto.collectiveAvgScore).toEqual(expectResult.collectiveAvgScore)
      expect(dto.qtyQuestionsAnswered).toEqual(expectResult.qtyQuestionsAnswered)
      expect(dto.qtyQuestionsCorrectAnswered).toEqual(expectResult.qtyQuestionsCorrectAnswered)
      expect(dto.isLastQuestionCorrectAnswered).toEqual(expectResult.isLastQuestionCorrectAnswered)
      expect(dto.avgGrade).toEqual(expectResult.avgGrade)
      expect(dto.srs).toEqual(expectResult.srs)
      expect(dto.history).toEqual(expectResult.history)
    })
  })
})
