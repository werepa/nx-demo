import { Discipline } from "../../domain/entity/Discipline"
import { Learning } from "../../domain/entity/Learning"
import { Question } from "../../domain/entity/Question"
import { Quiz } from "../../domain/entity/Quiz"
import { Topic } from "../../domain/entity/Topic"
import { User } from "../../domain/entity/User"
import { faker } from "@faker-js/faker"
import { disciplineMock, topicMock } from "../../tests/mocks/disciplineMock"
import { getCorrectOption } from "../../tests/mocks/questionMock"
import { CreateQuiz } from "../../application/usecase/CreateQuiz/CreateQuiz"
import { CheckQuizAnswer } from "../../application/usecase/CheckQuizAnswer/CheckQuizAnswer"
import { databaseFixture } from "../../tests/fixtures/databaseFixture"
import { DatabaseConnection } from "../database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../database/TestDatabaseAdapter"
import { DisciplineRepository } from "../../application/repository/DisciplineRepository"
import { LearningRepository } from "../../application/repository/LearningRepository"
import { QuestionRepository } from "../../application/repository/QuestionRepository"
import { QuizRepository } from "../../application/repository/QuizRepository"
import { UserRepository } from "../../application/repository/UserRepository"
import { DisciplineRepositoryDatabase } from "./DisciplineRepositoryDatabase"
import { UserRepositoryDatabase } from "./UserRepositoryDatabase"
import { QuestionRepositoryDatabase } from "./QuestionRepositoryDatabase"
import { LearningRepositoryDatabase } from "./LearningRepositoryDatabase"
import { QuizRepositoryDatabase } from "./QuizRepositoryDatabase"
import { GetQuizById } from "../../application/usecase"

describe("QuestionRepositoryDatabase", () => {
  let connection: DatabaseConnection
  let disciplineRepository: DisciplineRepository
  let questionRepository: QuestionRepository
  let portugues: Discipline
  let crase: Topic
  let pronomes: Topic

  beforeAll(() => {
    connection = getTestDatabaseAdapter()

    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)
  })

  beforeEach(async () => {
    await connection.clear(["questions", "topics", "disciplines"])

    portugues = disciplineMock({ name: "Português" })
    crase = topicMock({ name: "Crase" })
    pronomes = topicMock({ name: "Pronomes" })
    portugues.topics.add(crase)
    portugues.topics.add(pronomes)
    await disciplineRepository.save(portugues)
  })

  afterAll(async () => {
    await connection.close()
  })

  test("should save a new question", async () => {
    const question: Question = Question.create({
      prompt: "What is your favorite color?",
      options: [
        { text: "Blue", isCorrectAnswer: true },
        { text: "Red", isCorrectAnswer: false },
        { text: "Green", isCorrectAnswer: false },
        { text: "Yellow", isCorrectAnswer: false },
      ],
      topicId: crase.topicId,
      topicRootId: crase.topicRootId,
    })
    await questionRepository.save(question)
    const questions = await questionRepository.getAll({ showAll: true })
    expect(questions[0]).toEqual(question)
  })

  test("should update an existing question", async () => {
    const question: Question = Question.create({
      prompt: "What is your favorite color?",
      options: [
        { text: "Blue", isCorrectAnswer: true },
        { text: "Red", isCorrectAnswer: false },
        { text: "Green", isCorrectAnswer: false },
        { text: "Yellow", isCorrectAnswer: false },
      ],
      topicId: crase.topicId,
      topicRootId: crase.topicRootId,
    })
    await questionRepository.save(question)
    question.updatePrompt("What is your favorite food?")
    await questionRepository.save(question)
    const updatedQuestion = await questionRepository.getById(question.questionId)
    expect(updatedQuestion?.prompt).toEqual("What is your favorite food?")
  })

  test("should return all questions of a topic", async () => {
    const question1: Question = Question.create({
      prompt: "What is your favorite color?",
      options: [
        { text: "Blue", isCorrectAnswer: true },
        { text: "Red", isCorrectAnswer: false },
        { text: "Green", isCorrectAnswer: false },
        { text: "Yellow", isCorrectAnswer: false },
      ],
      topicId: crase.topicId,
      topicRootId: crase.topicRootId,
    })

    const question2: Question = Question.create({
      prompt: "What is your favorite food?",
      options: [
        { text: "Pizza", isCorrectAnswer: true },
        { text: "Hamburger", isCorrectAnswer: false },
        { text: "Sushi", isCorrectAnswer: false },
        { text: "Hot Dog", isCorrectAnswer: false },
      ],
      topicId: pronomes.topicId,
      topicRootId: pronomes.topicRootId,
    })

    const question3: Question = Question.create({
      prompt: "What is your favorite drink?",
      options: [
        { text: "Water", isCorrectAnswer: true },
        { text: "Soda", isCorrectAnswer: false },
        { text: "Juice", isCorrectAnswer: false },
        { text: "Beer", isCorrectAnswer: false },
      ],
      topicId: crase.topicId,
      topicRootId: crase.topicRootId,
    })
    question3.deactivate()

    await questionRepository.save(question1)
    await questionRepository.save(question2)
    await questionRepository.save(question3)

    const questions = await questionRepository.getAll({
      topicId: crase.topicId,
      showAll: true,
    })
    expect(questions).toHaveLength(2)
    expect(questions).toContainEqual(question1)
    expect(questions).toContainEqual(question3)

    const activeQuestions = await questionRepository.getAll({
      topicId: crase.topicId,
      showAll: false,
    })
    expect(activeQuestions).toHaveLength(1)
    expect(activeQuestions).toContainEqual(question1)
  })

  test("should return a question by id", async () => {
    const question: Question = Question.create({
      prompt: "What is your favorite color?",
      options: [
        { text: "Blue", isCorrectAnswer: true },
        { text: "Red", isCorrectAnswer: false },
        { text: "Green", isCorrectAnswer: false },
        { text: "Yellow", isCorrectAnswer: false },
      ],
      topicId: crase.topicId,
      topicRootId: crase.topicRootId,
    })
    await questionRepository.save(question)
    const foundQuestion = await questionRepository.getById(question.questionId)
    expect(foundQuestion).toEqual(question)
  })

  test("should return a question by hash", async () => {
    const question: Question = Question.create({
      prompt: "What is your favorite color?",
      options: [
        { text: "Blue", isCorrectAnswer: true },
        { text: "Red", isCorrectAnswer: false },
        { text: "Green", isCorrectAnswer: false },
        { text: "Yellow", isCorrectAnswer: false },
      ],
      topicId: crase.topicId,
      topicRootId: crase.topicRootId,
    })
    await questionRepository.save(question)
    const foundQuestion = await questionRepository.getByHash(question.simulexHash)
    expect(foundQuestion).toEqual(question)
  })

  test("should return null if a question with the given id does not exist!", async () => {
    const foundQuestion = await questionRepository.getById(faker.string.uuid())
    expect(foundQuestion).toBeNull()
  })

  test("should get statistics of questions about discipline", async () => {
    await connection.clear(["questions", "topics", "disciplines"])
    const portugues = disciplineMock({ name: "Português" })
    const crase = topicMock({ name: "Crase" })
    const pronomes = topicMock({ name: "Pronomes" })
    const palavrasRepetidas = topicMock({ name: "Palavras Repetidas" })
    portugues.topics.add(crase)
    portugues.topics.add(palavrasRepetidas)
    portugues.topics.add(pronomes)
    portugues.setTopicParent({ topic: palavrasRepetidas, topicParent: crase })
    await disciplineRepository.save(portugues)
    const direitoPenal = disciplineMock({ name: "Direito Penal" })
    const crimes = topicMock({ name: "Crimes" })
    direitoPenal.topics.add(crimes)
    await disciplineRepository.save(direitoPenal)
    const question1: Question = Question.create({
      prompt: "Pergunta 1 - Crase",
      options: [{ text: "Correta", isCorrectAnswer: true }],
      topicId: crase.topicId,
      topicRootId: crase.topicRootId,
    })
    const question2: Question = Question.create({
      prompt: "Pergunta 2 - Crase",
      options: [{ text: "Correta", isCorrectAnswer: true }],
      topicId: crase.topicId,
      topicRootId: crase.topicRootId,
    })
    const question3: Question = Question.create({
      prompt: "Pergunta 3 - Crase",
      options: [{ text: "Correta", isCorrectAnswer: true }],
      topicId: crase.topicId,
      topicRootId: crase.topicRootId,
    })
    question3.deactivate()
    const question4: Question = Question.create({
      prompt: "Pergunta 1 - Pronomes",
      options: [{ text: "Correta", isCorrectAnswer: true }],
      topicId: pronomes.topicId,
      topicRootId: pronomes.topicRootId,
    })
    const question5: Question = Question.create({
      prompt: "Pergunta 1 - Crimes",
      options: [{ text: "Correta", isCorrectAnswer: true }],
      topicId: crimes.topicId,
      topicRootId: crimes.topicRootId,
    })
    await questionRepository.save(question1)
    await questionRepository.save(question2)
    await questionRepository.save(question3)
    await questionRepository.save(question4)
    await questionRepository.save(question5)
    const portuguesStatistics = await questionRepository.getDisciplineStatistics(portugues.disciplineId)
    expect(portuguesStatistics.disciplineId).toBe(portugues.disciplineId)
    expect(portuguesStatistics.topics).toHaveLength(2)
    expect(portuguesStatistics.topics).toContainEqual({
      topicId: crase.topicId,
      qtyQuestions: 2,
    })
    expect(portuguesStatistics.topics).toContainEqual({
      topicId: pronomes.topicId,
      qtyQuestions: 1,
    })
    const direitoPenalStatistics = await questionRepository.getDisciplineStatistics(direitoPenal.disciplineId)
    expect(direitoPenalStatistics.disciplineId).toBe(direitoPenal.disciplineId)
    expect(direitoPenalStatistics.topics).toHaveLength(1)
    expect(direitoPenalStatistics.topics).toContainEqual({
      topicId: crimes.topicId,
      qtyQuestions: 1,
    })
  })

  describe("GetRandom", () => {
    let userRepository: UserRepository
    let quizRepository: QuizRepository
    let learningRepository: LearningRepository

    let createQuiz: CreateQuiz
    let getQuizById: GetQuizById
    let correctQuizAnswer: CheckQuizAnswer

    let userMember1: User
    let userMember2: User
    let quiz1: Quiz
    let quiz2: Quiz
    let questions: Question[]
    let learning1: Learning
    let learning2: Learning

    beforeEach(async () => {
      //repositories
      userRepository = new UserRepositoryDatabase(connection)
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
        connection,
        userRepository,
        disciplineRepository,
        questionRepository,
        quizRepository,
        correctQuizAnswer,
      })

      userMember1 = fixture.userMember1
      userMember2 = fixture.userMember2
      portugues = fixture.portugues
      crase = fixture.crase
      pronomes = fixture.pronomes

      const { quizId } = await createQuiz.execute({
        disciplineId: portugues.disciplineId,
        userId: userMember1.userId,
        topicsRoot: [crase.topicId, pronomes.topicId],
      })
      quiz1 = await getQuizById.execute(quizId)

      learning1 = await learningRepository.getDisciplineLearning(userMember1, portugues)
    })

    test("should get a random question from a topic that the user has not answered yet", async () => {
      connection.clear(["quiz_answers"])
      // Crase
      let nextQuestion = await questionRepository.getRandom({
        topicId: crase.topicId,
        userId: userMember1.userId,
        topicsRoot: quiz1.topicsRoot.listId(),
      })
      expect(nextQuestion).toBeInstanceOf(Question)
      expect(nextQuestion.topicId).toBe(crase.topicId)

      await correctQuizAnswer.execute({
        disciplineId: portugues.disciplineId,
        userId: userMember1.userId,
        userQuizAnswer: {
          quizId: quiz1.quizId,
          questionId: nextQuestion.questionId ?? null,
          userOptionId: getCorrectOption(nextQuestion),
          topicId: nextQuestion?.topicId ?? "",
        },
      })
      learning1 = await learningRepository.getDisciplineLearning(userMember1, portugues)

      expect(learning1.topic(crase.topicId)?.qtyQuestionsAnswered()).toBe(1)

      //Crase
      nextQuestion = await questionRepository.getRandom({
        topicId: crase.topicId,
        userId: userMember1.userId,
        topicsRoot: quiz1.topicsRoot.listId(),
      })
      expect(nextQuestion).toBeInstanceOf(Question)
      expect(nextQuestion.topicId).toBe(crase.topicId)

      await correctQuizAnswer.execute({
        disciplineId: portugues?.disciplineId,
        userId: userMember1.userId,
        userQuizAnswer: {
          quizId: quiz1.quizId,
          questionId: nextQuestion.questionId ?? "",
          userOptionId: getCorrectOption(nextQuestion),
          topicId: nextQuestion.topicId ?? "",
        },
      })
      learning1 = await learningRepository.getDisciplineLearning(userMember1, portugues)

      expect(learning1.topic(crase.topicId)?.qtyQuestionsAnswered()).toBe(2)

      // Pronomes
      nextQuestion = await questionRepository.getRandom({
        topicId: pronomes.topicId,
        userId: userMember1.userId,
        topicsRoot: quiz1.topicsRoot.listId(),
      })
      expect(nextQuestion).toBeInstanceOf(Question)
      expect(nextQuestion.topicId).toBe(pronomes.topicId)

      await correctQuizAnswer.execute({
        disciplineId: portugues.disciplineId,
        userId: userMember1.userId,
        userQuizAnswer: {
          quizId: quiz1.quizId,
          questionId: nextQuestion.questionId ?? "",
          userOptionId: getCorrectOption(nextQuestion),
          topicId: nextQuestion.topicId ?? "",
        },
      })
      learning1 = await learningRepository.getDisciplineLearning(userMember1, portugues)

      expect(learning1.topic(pronomes.topicId)?.qtyQuestionsAnswered()).toBe(1)
    })
  })
})
