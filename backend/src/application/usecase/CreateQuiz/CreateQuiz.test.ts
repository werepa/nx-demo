import {
  UserRepository,
  DisciplineRepository,
  QuestionRepository,
  QuizRepository,
  LearningRepository,
} from "../../repository"
import { QuizType } from "../../../domain/valueObject"
import { DatabaseConnection, getTestDatabaseAdapter } from "../../../infra/database"
import {
  UserRepositoryDatabase,
  DisciplineRepositoryDatabase,
  QuestionRepositoryDatabase,
  QuizRepositoryDatabase,
  LearningRepositoryDatabase,
} from "../../../infra/repository"
import { DateBr } from "../../../shared/domain/valueObject"
import { databaseFixture } from "../../../tests/fixtures/databaseFixture"
import { CreateQuizCommand, Discipline, Quiz, Topic, TopicLearning, User } from "../../../domain/entity"
import { faker } from "@faker-js/faker"
import { CheckQuizAnswer } from "../CheckQuizAnswer/CheckQuizAnswer"
import { CreateQuiz } from "./CreateQuiz"
import { GetQuizById } from "../GetQuizById/GetQuizById"
import { QuizTypeEnum } from "../../../shared/enum"

describe("UseCase => CreateQuiz", () => {
  let connection: DatabaseConnection
  let userRepository: UserRepository
  let disciplineRepository: DisciplineRepository
  let questionRepository: QuestionRepository
  let quizRepository: QuizRepository
  let learningRepository: LearningRepository

  let createQuiz: CreateQuiz
  let getQuizById: GetQuizById
  let correctQuizAnswer: CheckQuizAnswer

  let userFree: User
  let userMember: User
  let portugues: Discipline
  let pronomes: Topic
  let crase: Topic
  // let palavrasRepetidas: Topic
  // let distancia: Topic
  // let terra: Topic

  beforeEach(async () => {
    connection = getTestDatabaseAdapter()

    userRepository = new UserRepositoryDatabase(connection)
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)
    quizRepository = new QuizRepositoryDatabase(connection, userRepository, disciplineRepository)
    learningRepository = new LearningRepositoryDatabase(connection)

    await learningRepository.clear()
    await quizRepository.clear()
    await questionRepository.clear()
    await disciplineRepository.clear()
    await userRepository.clear()

    // useCases
    createQuiz = new CreateQuiz(quizRepository, userRepository, disciplineRepository)
    getQuizById = new GetQuizById(quizRepository)
    correctQuizAnswer = new CheckQuizAnswer(
      userRepository,
      disciplineRepository,
      questionRepository,
      quizRepository,
      learningRepository
    )

    const fixture = await databaseFixture({
      userRepository,
      disciplineRepository,
      questionRepository,
      quizRepository,
      correctQuizAnswer,
      createQuizzes: false,
    })

    userFree = fixture.userFree
    userMember = fixture.userMember1
    portugues = fixture.portugues
    pronomes = fixture.pronomes
    crase = fixture.crase
    // palavrasRepetidas = fixture.palavrasRepetidas
    // distancia = fixture.distancia
    // terra = fixture.terra
  })

  afterEach(() => {
    connection.close()
  })

  test("should create a quiz of the correct type", async () => {
    expect(portugues.topics.getCount()).toBe(13)
    expect(portugues.topics.getItems()[0].isActive).toBe(true)

    const dto = {
      userId: userMember.userId,
      disciplineId: portugues.disciplineId,
      topicsRoot: [crase.topicId, pronomes.topicId],
    }
    let { quizId } = await createQuiz.execute(dto)
    let quiz = await getQuizById.execute(quizId)

    const expectedTopicIds = [crase.topicId, pronomes.topicId].sort()
    const actualTopicIds = quiz.topicsRoot.listId().sort()

    expect(quiz).toBeInstanceOf(Quiz)
    expect(quiz.quizId).toHaveLength(36)
    expect(quiz.quizType.value).toBe(QuizTypeEnum.RANDOM)
    expect(quiz.user.userId).toBe(userMember.userId)
    expect(quiz.discipline.disciplineId).toBe(portugues.disciplineId)
    expect(actualTopicIds).toEqual(expectedTopicIds)
    expect(quiz.answers.getItems()).toEqual([])
    expect(quiz.isActive).toBe(true)
    expect(quiz.createdAt).toBeInstanceOf(DateBr)
    expect(quiz.updatedAt).toBe(null)

    const learning = await learningRepository.getDisciplineLearning(userMember, portugues)

    const craseLearning = learning.topics.findByTopicId(crase.topicId)

    expect(craseLearning).toBeInstanceOf(TopicLearning)
    expect(craseLearning.topic.topicId).toBe(crase.topicId)
    expect(craseLearning.userId).toBe(userMember.userId)
    expect(craseLearning.qtyQuestionsAnswered()).toBe(0)
    expect(craseLearning.qtyQuestionsCorrectAnswered()).toBe(0)
    expect(craseLearning.isLastQuestionCorrectAnswered()).toBe(null)
    expect(craseLearning.avgGrade()).toBe(null)
    ;({ quizId } = await createQuiz.execute({ ...dto, quizType: "learning" }))
    quiz = await getQuizById.execute(quizId)

    expect(quiz).toBeInstanceOf(Quiz)
    expect(quiz.quizType.value).toBe(QuizTypeEnum.LEARNING)
  })

  test("should create a quiz with all root topics if no one is provided", async () => {
    const dto = {
      userId: userMember.userId,
      disciplineId: portugues.disciplineId,
      topicsRoot: [],
    }
    const { quizId } = await createQuiz.execute(dto)
    const quiz = await getQuizById.execute(quizId)

    expect(quiz.topicsRoot.listId().length).toBeGreaterThan(0)
    expect(quiz.topicsRoot.listId()).toHaveLength(portugues.topicsRoot().length)
  })

  test("should modify old quiz if exists", async () => {
    const dto = {
      userId: userMember.userId,
      disciplineId: portugues.disciplineId,
      topicsRoot: [crase.topicId, pronomes.topicId],
    }
    let { quizId } = await createQuiz.execute(dto)
    const quiz1 = await getQuizById.execute(quizId)
    quiz1.deactivate()

    const dto2 = {
      userId: userMember.userId,
      disciplineId: portugues.disciplineId,
      topicsRoot: [],
    }
    ;({ quizId } = await createQuiz.execute(dto2))
    const quiz2 = await getQuizById.execute(quizId)

    const quizzes = await quizRepository.getAll({
      userId: userMember.userId,
      disciplineId: portugues.disciplineId,
    })

    expect(quiz1.quizId).toBe(quiz2.quizId)
    expect(quiz2.isActive).toBe(true)
    expect(quiz2.topicsRoot.listId()).toHaveLength(portugues.topicsRoot().length)
    expect(quizzes.length).toBe(1)
  })

  test("should prevent free users from creating special quizzes", async () => {
    const dto: CreateQuizCommand = {
      user: userFree,
      discipline: portugues,
    }
    const quiz = Quiz.create(dto)
    expect(quiz.quizType.value).toBe(QuizTypeEnum.RANDOM)
    expect(() => quiz.updateQuizType(QuizType.create("learning"))).toThrow(
      "Free users can only create random or review quizzes"
    )
  })

  test("should throw an error if the user does not exist!", async () => {
    const nonExistentUserId = faker.string.uuid()
    const dto = {
      userId: nonExistentUserId,
      disciplineId: portugues.disciplineId,
      topicsRoot: [crase.topicId, pronomes.topicId],
    }
    await expect(createQuiz.execute(dto)).rejects.toThrow(`User ID:${nonExistentUserId} does not exist!`)
  })

  test("should throw an error if the discipline does not exist!", async () => {
    const nonExistentDisciplineId = faker.string.uuid()
    const dto = {
      userId: userMember.userId,
      disciplineId: nonExistentDisciplineId,
      topicsRoot: [crase.topicId, pronomes.topicId],
    }
    await expect(createQuiz.execute(dto)).rejects.toThrow(`Discipline ID:${nonExistentDisciplineId} does not exist!`)
  })

  test("should throw an error if no root topics are provided", async () => {
    const nonExistentTopicId = faker.string.uuid()
    const dto = {
      userId: userMember.userId,
      disciplineId: portugues.disciplineId,
      topicsRoot: [nonExistentTopicId],
    }
    await expect(createQuiz.execute(dto)).rejects.toThrow(`No root topics provided`)
  })
})
