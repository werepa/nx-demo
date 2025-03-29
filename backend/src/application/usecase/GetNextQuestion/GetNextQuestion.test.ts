import { GetNextQuestion } from "./GetNextQuestion"
import { Question } from "../../../domain/entity/Question"
import { User } from "../../../domain/entity/User"
import { Discipline } from "../../../domain/entity/Discipline"
import { Topic } from "../../../domain/entity/Topic"
import { Quiz } from "../../../domain/entity/Quiz"
import { Learning } from "../../../domain/entity/Learning"
import { databaseFixture } from "../../../tests/fixtures/databaseFixture"
import { CheckQuizAnswer } from "../CheckQuizAnswer/CheckQuizAnswer"
import { CreateQuiz } from "../CreateQuiz/CreateQuiz"
import { getCorrectOption, getIncorrectOption } from "../../../tests/mocks/questionMock"
import { DatabaseConnection } from "../../../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../../../infra/database/TestDatabaseAdapter"
import { DisciplineRepository } from "../../repository/DisciplineRepository"
import { LearningRepository } from "../../repository/LearningRepository"
import { QuestionRepository } from "../../repository/QuestionRepository"
import { QuizRepository } from "../../repository/QuizRepository"
import { UserRepository } from "../../repository/UserRepository"
import { DisciplineRepositoryDatabase } from "../../../infra/repository/DisciplineRepositoryDatabase"
import { LearningRepositoryDatabase } from "../../../infra/repository/LearningRepositoryDatabase"
import { QuestionRepositoryDatabase } from "../../../infra/repository/QuestionRepositoryDatabase"
import { QuizRepositoryDatabase } from "../../../infra/repository/QuizRepositoryDatabase"
import { UserRepositoryDatabase } from "../../../infra/repository/UserRepositoryDatabase"
import { GetQuizById } from "../GetQuizById/GetQuizById"

describe("GetNextQuestion", () => {
  let connection: DatabaseConnection
  let disciplineRepository: DisciplineRepository
  let userRepository: UserRepository
  let questionRepository: QuestionRepository
  let quizRepository: QuizRepository
  let learningRepository: LearningRepository

  let createQuiz: CreateQuiz
  let getQuizById: GetQuizById
  let getNextQuestion: GetNextQuestion
  let correctQuizAnswer: CheckQuizAnswer

  let userMember1: User
  // let userMember2: User
  let portugues: Discipline
  // let portuguesClassificar: Topic
  let pronomes: Topic
  // let pessoais: Topic
  let casoReto: Topic
  let obliquos: Topic
  let tratamento: Topic
  let crase: Topic
  let palavrasRepetidas: Topic
  let palavrasMasculinas: Topic
  // let palavrasEspeciais: Topic
  let distancia: Topic
  let terra: Topic
  // let nomesCidades: Topic
  let quiz1: Quiz
  // let quiz2: Quiz
  // let questions: Question[]
  let learning1: Learning
  // let learning2: Learning

  beforeAll(async () => {
    connection = getTestDatabaseAdapter()

    userRepository = new UserRepositoryDatabase(connection)
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)
    quizRepository = new QuizRepositoryDatabase(connection, userRepository, disciplineRepository)
    learningRepository = new LearningRepositoryDatabase(connection)

    // useCases
    createQuiz = new CreateQuiz(quizRepository, userRepository, disciplineRepository)

    getQuizById = new GetQuizById(quizRepository)

    getNextQuestion = new GetNextQuestion(questionRepository, quizRepository, learningRepository)

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
    // userMember2 = fixture.userMember2
    portugues = fixture.portugues
    // portuguesClassificar = fixture.portuguesClassificar
    pronomes = fixture.pronomes
    // pessoais = fixture.pessoais
    casoReto = fixture.casoReto
    obliquos = fixture.obliquos
    tratamento = fixture.tratamento
    crase = fixture.crase
    palavrasRepetidas = fixture.palavrasRepetidas
    palavrasMasculinas = fixture.palavrasMasculinas
    // palavrasEspeciais = fixture.palavrasEspeciais
    distancia = fixture.distancia
    terra = fixture.terra
    // nomesCidades = fixture.nomesCidades

    const { quizId } = await createQuiz.execute({
      disciplineId: portugues?.disciplineId,
      userId: userMember1.userId,
      topicsRoot: [crase.topicId, pronomes.topicId],
    })
    quiz1 = await getQuizById.execute(quizId)

    learning1 = await learningRepository.getDisciplineLearning(userMember1, portugues)
  })

  afterAll(async () => {
    await connection.close()
  })

  test("should return the next question for a given quiz ID", async () => {
    const verifyNextQuestion = async (expectedTopic: Topic, correctAnswered = true) => {
      const nextQuestion = await getNextQuestion.execute({
        quizId: quiz1.quizId,
      })

      expect(nextQuestion).toBeInstanceOf(Question)
      expect(nextQuestion.topicId).toBe(expectedTopic.topicId)

      await correctQuizAnswer.execute({
        disciplineId: portugues?.disciplineId,
        userId: userMember1.userId,
        userQuizAnswer: {
          quizId: quiz1.quizId,
          questionId: nextQuestion.questionId,
          userOptionId: correctAnswered ? getCorrectOption(nextQuestion) : getIncorrectOption(nextQuestion),
          topicId: nextQuestion.topicId,
        },
      })
      learning1 = await learningRepository.getDisciplineLearning(userMember1, portugues)
    }

    /* Questions in database:
      Crase: 4
      Pronomes: 3
      Palavras Especiais: 0
      Pessoais: 0
      Caso Reto: 3
      Terra: 3
      Distância: 2
      Tratamento: 2
      Obliquos: 1
      Palavras Masculinas: 1
      Palavras Repetidas: 1
    */
    // Primeira rodada
    await verifyNextQuestion(crase)
    await verifyNextQuestion(pronomes, false)
    await verifyNextQuestion(casoReto, false)
    await verifyNextQuestion(terra)
    await verifyNextQuestion(distancia, false)
    await verifyNextQuestion(tratamento)

    expect(learning1.topic(crase.topicId)?.qtyQuestionsAnswered()).toBe(1)
    expect(learning1.topic(pronomes.topicId)?.qtyQuestionsAnswered()).toBe(1)
    expect(learning1.topic(casoReto.topicId)?.qtyQuestionsAnswered()).toBe(1)
    expect(learning1.topic(terra.topicId)?.qtyQuestionsAnswered()).toBe(1)
    expect(learning1.topic(distancia.topicId)?.qtyQuestionsAnswered()).toBe(1)
    expect(learning1.topic(tratamento.topicId)?.qtyQuestionsAnswered()).toBe(1)
    expect(learning1.topic(obliquos.topicId)?.qtyQuestionsAnswered()).toBe(0)
    expect(learning1.topic(palavrasMasculinas.topicId)?.qtyQuestionsAnswered()).toBe(0)
    expect(learning1.topic(palavrasRepetidas.topicId)?.qtyQuestionsAnswered()).toBe(0)

    expect(learning1.topic(crase.topicId)?.score()).toBe(1)
    expect(learning1.topic(pronomes.topicId)?.score()).toBe(0)
    expect(learning1.topic(casoReto.topicId)?.score()).toBe(0)
    expect(learning1.topic(terra.topicId)?.score()).toBe(1)
    expect(learning1.topic(distancia.topicId)?.score()).toBe(0)
    expect(learning1.topic(tratamento.topicId)?.score()).toBe(1)
    expect(learning1.topic(obliquos.topicId)?.score()).toBe(0)
    expect(learning1.topic(palavrasMasculinas.topicId)?.score()).toBe(0)
    expect(learning1.topic(palavrasRepetidas.topicId)?.score()).toBe(0)

    // Segunda rodada
    await verifyNextQuestion(pronomes)
    await verifyNextQuestion(casoReto, false)
    await verifyNextQuestion(distancia, false)
    await verifyNextQuestion(crase, false)
    await verifyNextQuestion(terra)
    await verifyNextQuestion(tratamento)
  })
})
