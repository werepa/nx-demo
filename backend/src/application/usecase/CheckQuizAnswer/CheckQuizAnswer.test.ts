import { User } from "../../../domain/entity/User"
import { Discipline } from "../../../domain/entity/Discipline"
import { Topic } from "../../../domain/entity/Topic"
import { Quiz } from "../../../domain/entity/Quiz"
import { Question } from "../../../domain/entity/Question"
import { Learning } from "../../../domain/entity/Learning"
import { CheckQuizAnswer, CheckQuizAnswerCommand, CreateQuiz, GetQuizById } from ".."
import { databaseFixture } from "../../../tests/fixtures/databaseFixture"
import { getCorrectOption, getIncorrectOption } from "../../../tests/mocks/questionMock"
import { DatabaseConnection } from "../../../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../../../infra/database/TestDatabaseAdapter"
import { DisciplineRepository } from "../../repository/DisciplineRepository"
import { LearningRepository } from "../../repository/LearningRepository"
import { QuestionRepository } from "../../repository/QuestionRepository"
import { QuizRepository } from "../../repository/QuizRepository"
import { UserRepository } from "../../repository/UserRepository"
import { DisciplineRepositoryDatabase } from "../../../infra/repository/DisciplineRepositoryDatabase"
import { QuestionRepositoryDatabase } from "../../../infra/repository/QuestionRepositoryDatabase"
import { QuizRepositoryDatabase } from "../../../infra/repository/QuizRepositoryDatabase"
import { UserRepositoryDatabase } from "../../../infra/repository/UserRepositoryDatabase"
import { LearningRepositoryDatabase } from "../../../infra/repository/LearningRepositoryDatabase"
import { faker } from "@faker-js/faker"

describe("CheckQuizAnswer", () => {
  let connection: DatabaseConnection
  let disciplineRepository: DisciplineRepository
  let userRepository: UserRepository
  let questionRepository: QuestionRepository
  let quizRepository: QuizRepository
  let learningRepository: LearningRepository
  let createQuiz: CreateQuiz
  let getQuizById: GetQuizById
  let correctQuizAnswer: CheckQuizAnswer

  let userMember1: User
  let userMember2: User
  let portugues: Discipline
  let pronomes: Topic
  let crase: Topic
  let quiz1: Quiz
  let quiz2: Quiz
  let questions: Question[]
  let learning1: Learning
  let learning2: Learning

  beforeAll(async () => {
    connection = getTestDatabaseAdapter()

    userRepository = new UserRepositoryDatabase(connection)
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)
    quizRepository = new QuizRepositoryDatabase(connection, userRepository, disciplineRepository)
    learningRepository = new LearningRepositoryDatabase(connection)

    await connection.clear([
      "user_topic_learnings",
      "quiz_answers",
      "quizzes",
      "questions",
      "topics",
      "disciplines",
      "users",
    ])

    // UseCase
    createQuiz = new CreateQuiz(quizRepository, userRepository, disciplineRepository)

    getQuizById = new GetQuizById(quizRepository)

    correctQuizAnswer = new CheckQuizAnswer(
      userRepository,
      disciplineRepository,
      questionRepository,
      quizRepository,
      learningRepository
    )
  })

  beforeEach(async () => {
    await connection.clear([
      "user_topic_learnings",
      "quiz_answers",
      "quizzes",
      "questions",
      "topics",
      "disciplines",
      "users",
    ])

    const fixture = await databaseFixture({
      connection,
      userRepository,
      disciplineRepository,
      questionRepository,
      quizRepository,
      correctQuizAnswer,
      createQuizzes: false,
    })

    userMember1 = fixture.userMember1
    userMember2 = fixture.userMember2
    portugues = fixture.portugues
    crase = fixture.crase
    pronomes = fixture.pronomes

    questions = await questionRepository.getAll({ topicId: crase.topicId })

    const { quizId } = await createQuiz.execute({
      disciplineId: portugues?.disciplineId,
      userId: userMember1.userId,
      topicsRoot: [crase.topicId, pronomes.topicId],
    })
    quiz1 = await getQuizById.execute(quizId)

    learning1 = await learningRepository.getDisciplineLearning(userMember1, portugues)
  })

  afterAll(() => {
    connection.close()
  })

  test("should execute the correct quiz answer", async () => {
    expect(learning1.topics.getCount()).toBe(13)
    expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestionsAnswered()).toBe(0)
    expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestionsCorrectAnswered()).toBe(0)
    expect(learning1.topics.findByTopicId(crase.topicId)?.isLastQuestionCorrectAnswered()).toBe(null)
    expect(learning1.topics.findByTopicId(crase.topicId)?.avgGrade()).toBe(null)
    expect(questions[0].topicId).toBe(crase.topicId)

    // UserMember 1
    let dto: CheckQuizAnswerCommand = {
      disciplineId: portugues?.disciplineId,
      userId: userMember1.userId,
      userQuizAnswer: {
        quizId: quiz1.quizId,
        questionId: questions[0].questionId,
        userOptionId: getCorrectOption(questions[0]),
        topicId: questions[0].topicId,
      },
    }
    await correctQuizAnswer.execute(dto)
    learning1 = await learningRepository.getDisciplineLearning(userMember1, portugues)

    expect(learning1.topics.getCount()).toBe(13)
    expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestionsCorrectAnswered()).toBe(1)
    expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestionsAnswered()).toBe(1)
    expect(learning1.topics.findByTopicId(crase.topicId)?.isLastQuestionCorrectAnswered()).toBe(true)
    expect(learning1.topics.findByTopicId(crase.topicId)?.avgGrade()).toBe(100)
    expect(learning1.topics.findByTopicId(crase.topicId)?.collectiveAvgGrade).toBe(null)

    // UserMember 2
    const { quizId } = await createQuiz.execute({
      disciplineId: portugues?.disciplineId,
      userId: userMember2.userId,
      topicsRoot: [crase.topicId],
    })
    quiz2 = await getQuizById.execute(quizId)
    learning2 = await learningRepository.getDisciplineLearning(userMember2, portugues)
    dto = {
      disciplineId: portugues?.disciplineId,
      userId: userMember2.userId,
      userQuizAnswer: {
        quizId: quiz2.quizId,
        questionId: questions[0].questionId,
        userOptionId: getCorrectOption(questions[0]),
        topicId: questions[0].topicId,
      },
    }
    await correctQuizAnswer.execute(dto)
    learning2 = await learningRepository.getDisciplineLearning(userMember2, portugues)
    expect(learning2.topics.findByTopicId(crase.topicId)?.avgGrade()).toBe(100)

    // UserMember 1
    dto = {
      disciplineId: portugues?.disciplineId,
      userId: userMember1.userId,
      userQuizAnswer: {
        quizId: quiz1.quizId,
        questionId: questions[1].questionId,
        userOptionId: getIncorrectOption(questions[1]),
        topicId: questions[1].topicId,
      },
    }
    await correctQuizAnswer.execute(dto)
    learning1 = await learningRepository.getDisciplineLearning(userMember1, portugues)

    expect(learning1.topics.getCount()).toBe(13)
    expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestionsCorrectAnswered()).toBe(1)
    expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestionsAnswered()).toBe(2)
    expect(learning1.topics.findByTopicId(crase.topicId)?.avgGrade()).toBe(50)
    expect(learning1.topics.findByTopicId(crase.topicId)?.collectiveAvgGrade).toBe(null)
    expect(learning1.topics.findByTopicId(crase.topicId)?.isLastQuestionCorrectAnswered()).toBe(false)
    expect(learning1.toDTO()).toBeTruthy()
  })

  test("should throw an error when user does not exist", async () => {
    const nonExistentUserId = faker.string.uuid()
    const dto = {
      disciplineId: portugues?.disciplineId,
      userId: nonExistentUserId,
      userQuizAnswer: {
        quizId: quiz1.quizId,
        questionId: questions[0].questionId,
        userOptionId: questions[0].options.getItems()[0].optionId,
        topicId: questions[0].topicId,
      },
    }

    await expect(correctQuizAnswer.execute(dto)).rejects.toThrow(`User ID:${dto.userId} does not exist!`)
  })

  test("should throw an error when discipline does not exist", async () => {
    const nonExistentDisciplineId = faker.string.uuid()
    const dto = {
      disciplineId: nonExistentDisciplineId,
      userId: userMember1.userId,
      userQuizAnswer: {
        quizId: quiz1.quizId,
        questionId: questions[0].questionId,
        userOptionId: questions[0].options.getItems()[0].optionId,
        topicId: questions[0].topicId,
      },
    }

    await expect(correctQuizAnswer.execute(dto)).rejects.toThrow(`Discipline ID:${dto.disciplineId} does not exist!`)
  })
})
