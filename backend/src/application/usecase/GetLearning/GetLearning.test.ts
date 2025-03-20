import { User } from "../../../domain/entity/User"
import { Discipline } from "../../../domain/entity/Discipline"
import { Topic } from "../../../domain/entity/Topic"
import { TopicLearning } from "../../../domain/entity/TopicLearning"
import { databaseFixture } from "../../../tests/fixtures/databaseFixture"
import { GetLearning } from "./GetLearning"
import { CheckQuizAnswer } from "../CheckQuizAnswer/CheckQuizAnswer"
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

describe("GetLearning", () => {
  let connection: DatabaseConnection
  let userRepository: UserRepository
  let disciplineRepository: DisciplineRepository
  let questionRepository: QuestionRepository
  let quizRepository: QuizRepository
  let learningRepository: LearningRepository

  let correctQuizAnswer: CheckQuizAnswer
  let getLearning: GetLearning

  let userFree: User
  let userTeacher: User
  let userMember1: User
  let userMember2: User
  let userInactive: User
  let userAdmin: User

  let direitoPenal: Discipline
  let direitoConstitucional: Discipline
  let direitoAdministrativo: Discipline
  let portugues: Discipline

  let portuguesClassificar: Topic
  let pronomes: Topic
  let pessoais: Topic
  let casoReto: Topic
  let obliquos: Topic
  let tratamento: Topic
  let crase: Topic
  let palavrasRepetidas: Topic
  let palavrasMasculinas: Topic
  let palavrasEspeciais: Topic
  let distancia: Topic
  let terra: Topic
  let nomesCidades: Topic
  let inqueritoPolicial: Topic
  let direitosGarantiasIndividuais: Topic
  let poderesAdministrativos: Topic
  let poderVinculado: Topic
  let topicInactive: Topic

  let topicLearning: TopicLearning

  beforeEach(async () => {
    connection = getTestDatabaseAdapter()

    userRepository = new UserRepositoryDatabase(connection)
    disciplineRepository = new DisciplineRepositoryDatabase(connection)

    await disciplineRepository.clear()
    await userRepository.clear()

    questionRepository = new QuestionRepositoryDatabase(connection)
    quizRepository = new QuizRepositoryDatabase(
      connection,
      userRepository,
      disciplineRepository,
    )
    learningRepository = new LearningRepositoryDatabase(connection)

    // useCases
    correctQuizAnswer = new CheckQuizAnswer(
      userRepository,
      disciplineRepository,
      questionRepository,
      quizRepository,
      learningRepository,
    )
    getLearning = new GetLearning(
      disciplineRepository,
      userRepository,
      learningRepository,
    )

    const fixture = await databaseFixture({
      userRepository,
      disciplineRepository,
      questionRepository,
      quizRepository,
      correctQuizAnswer,
    })

    userFree = fixture.userFree
    userTeacher = fixture.userTeacher
    userMember1 = fixture.userMember1
    userMember2 = fixture.userMember2
    userInactive = fixture.userInactive
    userAdmin = fixture.userAdmin

    direitoPenal = fixture.direitoPenal
    direitoConstitucional = fixture.direitoConstitucional
    direitoAdministrativo = fixture.direitoAdministrativo
    portugues = fixture.portugues

    portuguesClassificar = fixture.portuguesClassificar
    pronomes = fixture.pronomes
    pessoais = fixture.pessoais
    casoReto = fixture.casoReto
    obliquos = fixture.obliquos
    tratamento = fixture.tratamento
    crase = fixture.crase
    palavrasRepetidas = fixture.palavrasRepetidas
    palavrasMasculinas = fixture.palavrasMasculinas
    palavrasEspeciais = fixture.palavrasEspeciais
    distancia = fixture.distancia
    terra = fixture.terra
    nomesCidades = fixture.nomesCidades
    inqueritoPolicial = fixture.inqueritoPolicial
    direitosGarantiasIndividuais = fixture.direitosGarantiasIndividuais
    poderesAdministrativos = fixture.poderesAdministrativos
    poderVinculado = fixture.poderVinculado
    topicInactive = fixture.topicInactive
  })

  afterEach(() => {
    connection.close()
  })

  it("should set discipline statistics properties", async () => {
    const learning1 = await getLearning.execute({
      disciplineId: portugues?.disciplineId,
      userId: userMember1.userId,
    })
    expect(learning1.topics.getCount()).toBe(13)
    // UserMember1
    topicLearning = learning1.topics.findByTopicId(crase.topicId)
    expect(topicLearning?.topic.topicId).toEqual(crase.topicId)
    expect(topicLearning?.qtyQuestions).toBe(4)
    expect(topicLearning?.qtyQuestionsRecursive).toBe(7)
    expect(topicLearning?.qtyAllQuestionsDepth).toBe(11)
    expect(topicLearning?.maxQtyAllQuestionsDepth).toBe(11)
    expect(topicLearning?.maxQtyAllQuestionsRootRecursive).toBe(11)
    expect(topicLearning?.frequencyInDepth).toBe(100)
    expect(topicLearning?.frequencyInDiscipline).toBe(1)
    expect(topicLearning?.difficultyRecursive).toBe(49.41) // TODO: Verify this value
    expect(topicLearning?.collectiveAvgGrade).toBe(54.16)
    expect(topicLearning?.collectiveAvgScore).toBe(0.5) // TODO: Verify this value
    expect(topicLearning?.difficulty).toBe(45.84)
    expect(topicLearning?.parent).toEqual(learning1)
    expect(topicLearning?.levelInTopic()).toBe(50) // TODO: Fix this test
    expect(topicLearning?.qtyQuestionsCorrectAnswered()).toBe(1)
    expect(topicLearning?.qtyQuestionsAnswered()).toBe(3)
    expect(topicLearning?.avgGrade()).toBe(33.33)
    expect(topicLearning?.isLastQuestionCorrectAnswered()).toBe(false)

    const learning2 = await getLearning.execute({
      disciplineId: portugues?.disciplineId,
      userId: userMember2.userId,
    })
    expect(learning2.topics.getCount()).toBe(13)
    // UserMember2
    topicLearning = learning2.topics.findByTopicId(crase.topicId)
    expect(topicLearning?.topic.topicId).toEqual(crase.topicId)
    expect(topicLearning?.qtyQuestions).toBe(4)
    expect(topicLearning?.qtyQuestionsRecursive).toBe(7)
    expect(topicLearning?.qtyAllQuestionsDepth).toBe(11)
    expect(topicLearning?.maxQtyAllQuestionsDepth).toBe(11)
    expect(topicLearning?.maxQtyAllQuestionsRootRecursive).toBe(11)
    expect(topicLearning?.frequencyInDepth).toBe(100)
    expect(topicLearning?.frequencyInDiscipline).toBe(1)
    expect(topicLearning?.difficultyRecursive).toBe(49.41)
    expect(topicLearning?.collectiveAvgGrade).toBe(54.16)
    expect(topicLearning?.collectiveAvgScore).toBe(0.5)
    expect(topicLearning?.difficulty).toBe(45.84)
    expect(topicLearning?.parent).toEqual(learning2)
    expect(topicLearning?.levelInTopic()).toBe(50) // TODO: Fix this test
    expect(topicLearning?.qtyQuestionsCorrectAnswered()).toBe(3)
    expect(topicLearning?.qtyQuestionsAnswered()).toBe(4)
    expect(topicLearning?.avgGrade()).toBe(75)
    expect(topicLearning?.isLastQuestionCorrectAnswered()).toBe(true)
  })
})
