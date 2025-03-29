import { databaseFixture } from "./databaseFixture"
import { CheckQuizAnswer } from "../../application/usecase/CheckQuizAnswer/CheckQuizAnswer"
import { GetLearning } from "../../application/usecase/GetLearning/GetLearning"
import { User } from "../../domain/entity/User"
import { Discipline } from "../../domain/entity/Discipline"
import { Topic } from "../../domain/entity/Topic"
import { DatabaseConnection } from "../../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../../infra/database/TestDatabaseAdapter"
import { DisciplineRepository } from "../../application/repository/DisciplineRepository"
import { LearningRepository } from "../../application/repository/LearningRepository"
import { QuestionRepository } from "../../application/repository/QuestionRepository"
import { QuizRepository } from "../../application/repository/QuizRepository"
import { UserRepository } from "../../application/repository/UserRepository"
import { DisciplineRepositoryDatabase } from "../../infra/repository/DisciplineRepositoryDatabase"
import { LearningRepositoryDatabase } from "../../infra/repository/LearningRepositoryDatabase"
import { QuestionRepositoryDatabase } from "../../infra/repository/QuestionRepositoryDatabase"
import { QuizRepositoryDatabase } from "../../infra/repository/QuizRepositoryDatabase"
import { UserRepositoryDatabase } from "../../infra/repository/UserRepositoryDatabase"

describe("Fixture => Database", () => {
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

    // UseCases
    correctQuizAnswer = new CheckQuizAnswer(
      userRepository,
      disciplineRepository,
      questionRepository,
      quizRepository,
      learningRepository
    )
    getLearning = new GetLearning(disciplineRepository, userRepository, learningRepository)

    const fixture = await databaseFixture({
      connection,
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

  afterAll(async () => {
    await connection.close()
  })

  it("should create test users", async () => {
    expect(await userRepository.getAll({})).toHaveLength(5)
    expect(await userRepository.getAll({ showAll: true })).toHaveLength(6)

    expect(userAdmin.role).toBe("Administrator")
    expect(userFree.role).toBe("Free")
    expect(userTeacher.role).toBe("Teacher")
    expect(userMember1.role).toBe("Member")
    expect(userMember2.role).toBe("Member")
    expect(userInactive.isActive).toBe(false)
  })

  it("should create test disciplines", async () => {
    expect(await disciplineRepository.getAll({ showAll: true })).toHaveLength(5)

    expect(portugues?.topics.getItems()).toHaveLength(13)
    expect(portuguesClassificar.depth).toBe(1)
    expect(pronomes.depth).toBe(1)
    expect(pessoais.depth).toBe(2)
    expect(casoReto.depth).toBe(3)
    expect(obliquos.depth).toBe(3)
    expect(tratamento.depth).toBe(2)
    expect(crase.depth).toBe(1)
    expect(palavrasRepetidas.depth).toBe(2)
    expect(palavrasMasculinas.depth).toBe(2)
    expect(palavrasEspeciais.depth).toBe(2)
    expect(distancia.depth).toBe(3)
    expect(terra.depth).toBe(3)
    expect(nomesCidades.depth).toBe(2)

    expect(direitoPenal?.topics.getItems()).toHaveLength(2)
    expect(inqueritoPolicial.depth).toBe(1)

    expect(direitoConstitucional?.topics.getItems()).toHaveLength(2)
    expect(direitosGarantiasIndividuais.depth).toBe(1)

    expect(direitoAdministrativo?.topics.getItems()).toHaveLength(4)
    expect(poderesAdministrativos.depth).toBe(1)
    expect(poderVinculado.depth).toBe(2)
    expect(topicInactive.depth).toBe(1)

    expect(topicInactive.isActive).toBe(false)
  })

  it("should create test questions", async () => {
    expect(await questionRepository.getAll({ showAll: true })).toHaveLength(25)
    expect(
      await questionRepository.getAll({
        topicId: portuguesClassificar.topicId,
      })
    ).toHaveLength(1)
    expect(await questionRepository.getAll({ topicId: pronomes.topicId })).toHaveLength(3)
    expect(await questionRepository.getAll({ topicId: pessoais.topicId })).toHaveLength(0)
    expect(await questionRepository.getAll({ topicId: casoReto.topicId })).toHaveLength(3)
    expect(await questionRepository.getAll({ topicId: obliquos.topicId })).toHaveLength(1)
    expect(await questionRepository.getAll({ topicId: tratamento.topicId })).toHaveLength(2)
    expect(await questionRepository.getAll({ topicId: crase.topicId })).toHaveLength(4)
    expect(await questionRepository.getAll({ topicId: palavrasRepetidas.topicId })).toHaveLength(1)
    expect(await questionRepository.getAll({ topicId: palavrasMasculinas.topicId })).toHaveLength(1)
    expect(await questionRepository.getAll({ topicId: palavrasEspeciais.topicId })).toHaveLength(0)
    expect(await questionRepository.getAll({ topicId: distancia.topicId })).toHaveLength(2)
    expect(await questionRepository.getAll({ topicId: terra.topicId })).toHaveLength(3)
    expect(await questionRepository.getAll({ topicId: nomesCidades.topicId })).toHaveLength(0)
    expect(await questionRepository.getAll({ topicId: inqueritoPolicial.topicId })).toHaveLength(0)
    expect(
      await questionRepository.getAll({
        topicId: direitosGarantiasIndividuais.topicId,
      })
    ).toHaveLength(0)
    expect(
      await questionRepository.getAll({
        topicId: poderesAdministrativos.topicId,
      })
    ).toHaveLength(2)
    expect(await questionRepository.getAll({ topicId: poderVinculado.topicId })).toHaveLength(1)
    expect(await questionRepository.getAll({ topicId: topicInactive.topicId })).toHaveLength(0)

    expect(
      await questionRepository.getAll({
        topicId: crase.topicId,
        showAll: true,
      })
    ).toHaveLength(5)

    const learning1 = await getLearning.execute({
      disciplineId: portugues?.disciplineId,
      userId: userMember1.userId,
    })

    expect(learning1.topics.getItems()).toHaveLength(13)
    expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestions).toBe(4)
    expect(learning1.topics.findByTopicId(terra.topicId)?.qtyQuestions).toBe(3)
    expect(learning1.topics.findByTopicId(pronomes.topicId)?.qtyQuestions).toBe(3)
  })

  it("should create test quizzes", async () => {
    const quizzes = await quizRepository.getAll({ userId: userMember1.userId })
    expect(quizzes).toHaveLength(1)
    expect(quizzes[0].discipline.disciplineId).toBe(portugues?.disciplineId)
    expect(quizzes[0].topicsRoot.getItems()).toHaveLength(2)
    expect(quizzes[0].topicsRoot.getItems()[0].name).toBe("Crase")
    expect(quizzes[0].topicsRoot.getItems()[1].name).toBe("Pronomes")

    // UserMember1 Statistics
    let learning = await learningRepository.getDisciplineLearning(userMember1, portugues)

    let craseLearning = learning?.topics.findByTopicId(crase.topicId)
    expect(learning?.discipline.disciplineId).toBe(portugues?.disciplineId)
    expect(craseLearning).toBeDefined()
    expect(craseLearning?.qtyQuestionsCorrectAnswered()).toBe(1)
    expect(craseLearning?.qtyQuestionsAnswered()).toBe(3)

    let palavrasRepetidasStatistics = learning?.topics.findByTopicId(palavrasRepetidas.topicId)
    expect(palavrasRepetidasStatistics).toBeDefined()
    expect(palavrasRepetidasStatistics?.qtyQuestionsCorrectAnswered()).toBe(1)
    expect(palavrasRepetidasStatistics?.qtyQuestionsAnswered()).toBe(1)

    let distanciaStatistics = learning?.topics.findByTopicId(distancia.topicId)
    expect(distanciaStatistics).toBeDefined()
    expect(distanciaStatistics?.qtyQuestionsCorrectAnswered()).toBe(2)
    expect(distanciaStatistics?.qtyQuestionsAnswered()).toBe(2)

    let terraStatistics = learning?.topics.findByTopicId(terra.topicId)
    expect(terraStatistics).toBeDefined()
    expect(terraStatistics?.qtyQuestionsCorrectAnswered()).toBe(1)
    expect(terraStatistics?.qtyQuestionsAnswered()).toBe(2)

    let pronomesStatistics = learning?.topics.findByTopicId(pronomes.topicId)
    expect(pronomesStatistics).toBeDefined()
    expect(pronomesStatistics?.qtyQuestionsCorrectAnswered()).toBe(2)
    expect(pronomesStatistics?.qtyQuestionsAnswered()).toBe(2)

    // UserMember2 Statistics
    learning = await learningRepository.getDisciplineLearning(userMember2, portugues)

    craseLearning = learning?.topics.findByTopicId(crase.topicId)
    expect(learning?.discipline.disciplineId).toBe(portugues?.disciplineId)
    expect(craseLearning).toBeDefined()
    expect(craseLearning?.qtyQuestionsCorrectAnswered()).toBe(3)
    expect(craseLearning?.qtyQuestionsAnswered()).toBe(4)

    palavrasRepetidasStatistics = learning?.topics.findByTopicId(palavrasRepetidas.topicId)
    expect(palavrasRepetidasStatistics).toBeDefined()
    expect(palavrasRepetidasStatistics?.qtyQuestionsCorrectAnswered()).toBe(1)
    expect(palavrasRepetidasStatistics?.qtyQuestionsAnswered()).toBe(1)

    distanciaStatistics = learning?.topics.findByTopicId(distancia.topicId)
    expect(distanciaStatistics).toBeDefined()
    expect(distanciaStatistics?.qtyQuestionsCorrectAnswered()).toBe(1)
    expect(distanciaStatistics?.qtyQuestionsAnswered()).toBe(1)

    terraStatistics = learning?.topics.findByTopicId(terra.topicId)
    expect(terraStatistics).toBeDefined()
    expect(terraStatistics?.qtyQuestionsCorrectAnswered()).toBe(0)
    expect(terraStatistics?.qtyQuestionsAnswered()).toBe(1)

    pronomesStatistics = learning?.topics.findByTopicId(pronomes.topicId)
    expect(pronomesStatistics).toBeDefined()
    expect(pronomesStatistics?.qtyQuestionsCorrectAnswered()).toBe(1)
    expect(pronomesStatistics?.qtyQuestionsAnswered()).toBe(1)
  })
})
