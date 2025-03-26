import { Discipline, Learning, Quiz, Topic, User } from "../../domain/entity"
import { DatabaseConnection, getTestDatabaseAdapter } from "../../infra/database"
import {
  DisciplineRepositoryDatabase,
  LearningRepositoryDatabase,
  QuestionRepositoryDatabase,
  QuizRepositoryDatabase,
  UserRepositoryDatabase,
} from "../../infra/repository"
import { databaseFixture } from "../../tests/fixtures"
import { GetLearning, CheckQuizAnswer, CreateQuiz } from "../usecase"
import { DisciplineRepository, LearningRepository, QuestionRepository, QuizRepository, UserRepository } from "./"

describe("QuizRepository", () => {
  let connection: DatabaseConnection
  let userRepository: UserRepository
  let disciplineRepository: DisciplineRepository
  let questionRepository: QuestionRepository
  let quizRepository: QuizRepository
  let learningRepository: LearningRepository

  let getLearning: GetLearning
  let correctQuizAnswer: CheckQuizAnswer
  let createQuiz: CreateQuiz

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

  let learning1: Learning
  let learning2: Learning

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

    // UseCase
    getLearning = new GetLearning(disciplineRepository, userRepository, learningRepository)
    createQuiz = new CreateQuiz(quizRepository, userRepository, disciplineRepository)
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

  test.only("should create fixture data", () => {
    expect(userFree.name).toBe("User Free")
    expect(userTeacher.name).toBe("User Teacher")
    expect(userMember1.name).toBe("User Member 1")
    expect(userMember2.name).toBe("User Member 2")
    expect(userInactive.name).toBe("User Inactive")
    expect(userAdmin.name).toBe("User Admin")

    expect(direitoPenal?.name).toBe("Direito Penal")
    expect(direitoConstitucional?.name).toBe("Direito Constitucional")
    expect(direitoAdministrativo?.name).toBe("Direito Administrativo")
    expect(portugues?.name).toBe("Português")

    expect(pronomes.name).toBe("Pronomes")
    expect(pessoais.name).toBe("Pessoais")
    expect(casoReto.name).toBe("Caso reto")
    expect(obliquos.name).toBe("Oblíquos")
    expect(tratamento.name).toBe("Tratamento")
    expect(crase.name).toBe("Crase")
    expect(palavrasRepetidas.name).toBe("Palavras repetidas")
    expect(palavrasMasculinas.name).toBe("Palavras masculinas")
    expect(palavrasEspeciais.name).toBe("Palavras especiais")
    expect(distancia.name).toBe("Distância")
    expect(terra.name).toBe("Terra")
    expect(nomesCidades.name).toBe("Nomes de cidades")
    expect(inqueritoPolicial.name).toBe("Inquérito Policial")
    expect(direitosGarantiasIndividuais.name).toBe("Direitos e Garantias Individuais")
    expect(poderesAdministrativos.name).toBe("Poderes Administrativos")
    expect(poderVinculado.name).toBe("Poder Vinculado")
    expect(topicInactive.name).toBe("Topic Inactive")

    expect(portugues?.maxTopicsDepth()).toBe(3)
  })

  test("should get statistics from user learning", async () => {
    const fixture = await databaseFixture({
      userRepository,
      disciplineRepository,
      questionRepository,
      quizRepository,
      correctQuizAnswer,
      createQuizzes: false,
    })
    userMember1 = fixture.userMember1
    portugues = fixture.portugues
    crase = fixture.crase

    learning1 = await getLearning.execute({
      disciplineId: portugues?.disciplineId,
      userId: userMember1.userId,
    })

    const quiz = await createQuiz.execute({
      disciplineId: portugues?.disciplineId,
      userId: userMember1.userId,
      topicsRoot: [crase.topicId],
    })

    expect(quiz).toHaveProperty("quizId")
    expect(learning1.topics.getItems()).toHaveLength(13)
    expect(learning1.topics.findByTopicId(crase.topicId)?.frequencyInDepth).toBe(100)
    expect(learning1.topics.findByTopicId(crase.topicId)?.frequencyInDiscipline).toBe(1)
    expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestions).toBe(4)
    expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestionsAnswered()).toBe(0)
    expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestionsCorrectAnswered()).toBe(0)
    expect(learning1.topics.findByTopicId(crase.topicId)?.avgGrade()).toBe(null)
    expect(learning1.topics.findByTopicId(crase.topicId)?.collectiveAvgGrade).toBe(null)
  })

  /* Qtde de questões ativas por assunto e total recursivamente
  - Português
        => A classificar (1)

        => Crase (1) (11)
          => Entre palavras repetidas (2)
          => Antes de palavras masculinas
          => Palavras especiais
            => Distância
            => Terra
          => Nomes de cidades

        => Pronomes
          => Pessoais
            => Caso reto
            => Oblíquos
          => Tratamento

    */
  describe("Calculate statistics learning of a topic of discipline", () => {
    beforeEach(async () => {
      learning1 = await getLearning.execute({
        disciplineId: portugues?.disciplineId,
        userId: userMember1.userId,
      })
    })

    test("should have required parameters", () => {
      // @ts-expect-error - Testing if the method throws an error when the topicId is not passed
      expect(() => learning1.topics.findByTopicId()).toThrow("Topic ID is required")
      expect(learning1.topics.findByTopicId("any_id")).toBeNull()
    })

    test("should calculate depth of topic in discipline", () => {
      expect(portugues?.statistics(portuguesClassificar.topicId).depth).toBe(1)
      expect(portugues?.statistics(crase.topicId).depth).toBe(1)
      expect(portugues?.statistics(palavrasRepetidas.topicId).depth).toBe(2)
      expect(portugues?.statistics(palavrasMasculinas.topicId).depth).toBe(2)
      expect(portugues?.statistics(palavrasEspeciais.topicId).depth).toBe(2)
      expect(portugues?.statistics(distancia.topicId).depth).toBe(3)
      expect(portugues?.statistics(terra.topicId).depth).toBe(3)
      expect(portugues?.statistics(nomesCidades.topicId).depth).toBe(2)
      expect(portugues?.statistics(pronomes.topicId).depth).toBe(1)
      expect(portugues?.statistics(pessoais.topicId).depth).toBe(2)
      expect(portugues?.statistics(casoReto.topicId).depth).toBe(3)
      expect(portugues?.statistics(obliquos.topicId).depth).toBe(3)
      expect(portugues?.statistics(tratamento.topicId).depth).toBe(2)
    })

    test("should calculate maxDepth of topic in discipline", () => {
      expect(portugues?.statistics(portuguesClassificar.topicId).maxDepth).toBe(1)
      expect(portugues?.statistics(crase.topicId).maxDepth).toBe(3)
      expect(portugues?.statistics(palavrasRepetidas.topicId).maxDepth).toBe(2)
      expect(portugues?.statistics(palavrasMasculinas.topicId).maxDepth).toBe(2)
      expect(portugues?.statistics(palavrasEspeciais.topicId).maxDepth).toBe(3)
      expect(portugues?.statistics(distancia.topicId).maxDepth).toBe(3)
      expect(portugues?.statistics(terra.topicId).maxDepth).toBe(3)
      expect(portugues?.statistics(nomesCidades.topicId).maxDepth).toBe(2)
      expect(portugues?.statistics(pronomes.topicId).maxDepth).toBe(3)
      expect(portugues?.statistics(pessoais.topicId).maxDepth).toBe(3)
      expect(portugues?.statistics(casoReto.topicId).maxDepth).toBe(3)
      expect(portugues?.statistics(obliquos.topicId).maxDepth).toBe(3)
      expect(portugues?.statistics(tratamento.topicId).maxDepth).toBe(2)
    })

    test("should calculate qtyChildren of topic in discipline", () => {
      expect(portugues?.statistics(portuguesClassificar.topicId).qtyChildren).toBe(0)
      expect(portugues?.statistics(crase.topicId).qtyChildren).toBe(4)
      expect(portugues?.statistics(palavrasRepetidas.topicId).qtyChildren).toBe(0)
      expect(portugues?.statistics(palavrasMasculinas.topicId).qtyChildren).toBe(0)
      expect(portugues?.statistics(palavrasEspeciais.topicId).qtyChildren).toBe(2)
      expect(portugues?.statistics(distancia.topicId).qtyChildren).toBe(0)
      expect(portugues?.statistics(terra.topicId).qtyChildren).toBe(0)
      expect(portugues?.statistics(nomesCidades.topicId).qtyChildren).toBe(0)
      expect(portugues?.statistics(pronomes.topicId).qtyChildren).toBe(2)
      expect(portugues?.statistics(pessoais.topicId).qtyChildren).toBe(2)
      expect(portugues?.statistics(casoReto.topicId).qtyChildren).toBe(0)
      expect(portugues?.statistics(obliquos.topicId).qtyChildren).toBe(0)
      expect(portugues?.statistics(tratamento.topicId).qtyChildren).toBe(0)
    })

    test("should calculate qtyChildrenRecursive of topic in discipline", () => {
      expect(portugues?.statistics(portuguesClassificar.topicId).qtyChildrenRecursive).toBe(0)
      expect(portugues?.statistics(crase.topicId).qtyChildrenRecursive).toBe(6)
      expect(portugues?.statistics(palavrasRepetidas.topicId).qtyChildrenRecursive).toBe(0)
      expect(portugues?.statistics(palavrasMasculinas.topicId).qtyChildrenRecursive).toBe(0)
      expect(portugues?.statistics(palavrasEspeciais.topicId).qtyChildrenRecursive).toBe(2)
      expect(portugues?.statistics(distancia.topicId).qtyChildrenRecursive).toBe(0)
      expect(portugues?.statistics(terra.topicId).qtyChildrenRecursive).toBe(0)
      expect(portugues?.statistics(nomesCidades.topicId).qtyChildrenRecursive).toBe(0)
      expect(portugues?.statistics(pronomes.topicId).qtyChildrenRecursive).toBe(4)
      expect(portugues?.statistics(pessoais.topicId).qtyChildrenRecursive).toBe(2)
      expect(portugues?.statistics(casoReto.topicId).qtyChildrenRecursive).toBe(0)
      expect(portugues?.statistics(obliquos.topicId).qtyChildrenRecursive).toBe(0)
      expect(portugues?.statistics(tratamento.topicId).qtyChildrenRecursive).toBe(0)
    })

    test("should calculate qtyQuestions of topic in discipline", () => {
      expect(learning1.topics.findByTopicId(portuguesClassificar.topicId)?.qtyQuestions).toBe(1)
      expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestions).toBe(4)
      expect(learning1.topics.findByTopicId(palavrasRepetidas.topicId)?.qtyQuestions).toBe(1)
      expect(learning1.topics.findByTopicId(palavrasMasculinas.topicId)?.qtyQuestions).toBe(1)
      expect(learning1.topics.findByTopicId(palavrasEspeciais.topicId)?.qtyQuestions).toBe(0)
      expect(learning1.topics.findByTopicId(distancia.topicId)?.qtyQuestions).toBe(2)
      expect(learning1.topics.findByTopicId(terra.topicId)?.qtyQuestions).toBe(3)
      expect(learning1.topics.findByTopicId(nomesCidades.topicId)?.qtyQuestions).toBe(0)
      expect(learning1.topics.findByTopicId(pronomes.topicId)?.qtyQuestions).toBe(3)
      expect(learning1.topics.findByTopicId(pessoais.topicId)?.qtyQuestions).toBe(0)
      expect(learning1.topics.findByTopicId(casoReto.topicId)?.qtyQuestions).toBe(3)
      expect(learning1.topics.findByTopicId(obliquos.topicId)?.qtyQuestions).toBe(1)
      expect(learning1.topics.findByTopicId(tratamento.topicId)?.qtyQuestions).toBe(2)
    })

    test("should calculate qtyQuestionsRecursive of topic in discipline", () => {
      expect(learning1.topics.findByTopicId(portuguesClassificar.topicId)?.qtyQuestionsRecursive).toBe(0)
      expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestionsRecursive).toBe(7)
      expect(learning1.topics.findByTopicId(palavrasRepetidas.topicId)?.qtyQuestionsRecursive).toBe(0)
      expect(learning1.topics.findByTopicId(palavrasMasculinas.topicId)?.qtyQuestionsRecursive).toBe(0)
      expect(learning1.topics.findByTopicId(palavrasEspeciais.topicId)?.qtyQuestionsRecursive).toBe(5)
      expect(learning1.topics.findByTopicId(distancia.topicId)?.qtyQuestionsRecursive).toBe(0)
      expect(learning1.topics.findByTopicId(terra.topicId)?.qtyQuestionsRecursive).toBe(0)
      expect(learning1.topics.findByTopicId(nomesCidades.topicId)?.qtyQuestionsRecursive).toBe(0)
      expect(learning1.topics.findByTopicId(pronomes.topicId)?.qtyQuestionsRecursive).toBe(6)
      expect(learning1.topics.findByTopicId(pessoais.topicId)?.qtyQuestionsRecursive).toBe(4)
      expect(learning1.topics.findByTopicId(casoReto.topicId)?.qtyQuestionsRecursive).toBe(0)
      expect(learning1.topics.findByTopicId(obliquos.topicId)?.qtyQuestionsRecursive).toBe(0)
      expect(learning1.topics.findByTopicId(tratamento.topicId)?.qtyQuestionsRecursive).toBe(0)
    })

    test("should calculate qtyAllQuestionsDepth of topic in discipline", () => {
      expect(learning1.topics.findByTopicId(portuguesClassificar.topicId)?.qtyAllQuestionsDepth).toBe(1)
      expect(learning1.topics.findByTopicId(crase.topicId)?.qtyAllQuestionsDepth).toBe(11)
      expect(learning1.topics.findByTopicId(palavrasRepetidas.topicId)?.qtyAllQuestionsDepth).toBe(1)
      expect(learning1.topics.findByTopicId(palavrasMasculinas.topicId)?.qtyAllQuestionsDepth).toBe(1)
      expect(learning1.topics.findByTopicId(palavrasEspeciais.topicId)?.qtyAllQuestionsDepth).toBe(5)
      expect(learning1.topics.findByTopicId(distancia.topicId)?.qtyAllQuestionsDepth).toBe(2)
      expect(learning1.topics.findByTopicId(terra.topicId)?.qtyAllQuestionsDepth).toBe(3)
      expect(learning1.topics.findByTopicId(nomesCidades.topicId)?.qtyAllQuestionsDepth).toBe(0)
      expect(learning1.topics.findByTopicId(pronomes.topicId)?.qtyAllQuestionsDepth).toBe(9)
      expect(learning1.topics.findByTopicId(pessoais.topicId)?.qtyAllQuestionsDepth).toBe(4)
      expect(learning1.topics.findByTopicId(casoReto.topicId)?.qtyAllQuestionsDepth).toBe(3)
      expect(learning1.topics.findByTopicId(obliquos.topicId)?.qtyAllQuestionsDepth).toBe(1)
      expect(learning1.topics.findByTopicId(tratamento.topicId)?.qtyAllQuestionsDepth).toBe(2)
    })

    test("should calculate qtyAllQuestionsRootRecursive of topic in discipline", () => {
      expect(learning1.topics.findByTopicId(portuguesClassificar.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
      expect(learning1.topics.findByTopicId(crase.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
      expect(learning1.topics.findByTopicId(palavrasRepetidas.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
      expect(learning1.topics.findByTopicId(palavrasMasculinas.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
      expect(learning1.topics.findByTopicId(palavrasEspeciais.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
      expect(learning1.topics.findByTopicId(distancia.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
      expect(learning1.topics.findByTopicId(terra.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
      expect(learning1.topics.findByTopicId(nomesCidades.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
      expect(learning1.topics.findByTopicId(pronomes.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
      expect(learning1.topics.findByTopicId(pessoais.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
      expect(learning1.topics.findByTopicId(casoReto.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
      expect(learning1.topics.findByTopicId(obliquos.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
      expect(learning1.topics.findByTopicId(tratamento.topicId)?.maxQtyAllQuestionsRootRecursive).toBe(11)
    })

    test("should calculate frequencyInDepth of topic in discipline", () => {
      expect(learning1.topics.findByTopicId(portuguesClassificar.topicId)?.frequencyInDepth).toBe(9.0909)
      expect(learning1.topics.findByTopicId(crase.topicId)?.frequencyInDepth).toBe(100)
      expect(learning1.topics.findByTopicId(palavrasRepetidas.topicId)?.frequencyInDepth).toBe(2)
      expect(learning1.topics.findByTopicId(palavrasMasculinas.topicId)?.frequencyInDepth).toBe(2)
      expect(learning1.topics.findByTopicId(palavrasEspeciais.topicId)?.frequencyInDepth).toBe(10)
      expect(learning1.topics.findByTopicId(distancia.topicId)?.frequencyInDepth).toBe(0.6667)
      expect(learning1.topics.findByTopicId(terra.topicId)?.frequencyInDepth).toBe(1)
      expect(learning1.topics.findByTopicId(nomesCidades.topicId)?.frequencyInDepth).toBe(0.0)
      expect(learning1.topics.findByTopicId(pronomes.topicId)?.frequencyInDepth).toBe(81.8182)
      expect(learning1.topics.findByTopicId(pessoais.topicId)?.frequencyInDepth).toBe(8)
      expect(learning1.topics.findByTopicId(casoReto.topicId)?.frequencyInDepth).toBe(1)
      expect(learning1.topics.findByTopicId(obliquos.topicId)?.frequencyInDepth).toBe(0.3333)
      expect(learning1.topics.findByTopicId(tratamento.topicId)?.frequencyInDepth).toBe(4)
    })

    test("should calculate frequencyInDiscipline of topic in discipline", () => {
      expect(learning1.topics.findByTopicId(portuguesClassificar.topicId)?.frequencyInDiscipline).toBe(0.0909)
      expect(learning1.topics.findByTopicId(crase.topicId)?.frequencyInDiscipline).toBe(1.0)
      expect(learning1.topics.findByTopicId(palavrasRepetidas.topicId)?.frequencyInDiscipline).toBe(0.0909)
      expect(learning1.topics.findByTopicId(palavrasMasculinas.topicId)?.frequencyInDiscipline).toBe(0.0909)
      expect(learning1.topics.findByTopicId(palavrasEspeciais.topicId)?.frequencyInDiscipline).toBe(0.4545)
      expect(learning1.topics.findByTopicId(distancia.topicId)?.frequencyInDiscipline).toBe(0.1818)
      expect(learning1.topics.findByTopicId(terra.topicId)?.frequencyInDiscipline).toBe(0.2727)
      expect(learning1.topics.findByTopicId(nomesCidades.topicId)?.frequencyInDiscipline).toBe(0.0)
      expect(learning1.topics.findByTopicId(pronomes.topicId)?.frequencyInDiscipline).toBe(0.8182)
      expect(learning1.topics.findByTopicId(pessoais.topicId)?.frequencyInDiscipline).toBe(0.3636)
      expect(learning1.topics.findByTopicId(casoReto.topicId)?.frequencyInDiscipline).toBe(0.2727)
      expect(learning1.topics.findByTopicId(obliquos.topicId)?.frequencyInDiscipline).toBe(0.0909)
      expect(learning1.topics.findByTopicId(tratamento.topicId)?.frequencyInDiscipline).toBe(0.1818)
    })

    test("should calculate user qtyQuestionsCorrectAnswered of topic in discipline", () => {
      expect(learning1.topics.findByTopicId(portuguesClassificar.topicId)?.qtyQuestionsCorrectAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestionsCorrectAnswered()).toBe(1)
      expect(learning1.topics.findByTopicId(palavrasRepetidas.topicId)?.qtyQuestionsCorrectAnswered()).toBe(1)
      expect(learning1.topics.findByTopicId(palavrasMasculinas.topicId)?.qtyQuestionsCorrectAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(palavrasEspeciais.topicId)?.qtyQuestionsCorrectAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(distancia.topicId)?.qtyQuestionsCorrectAnswered()).toBe(2)
      expect(learning1.topics.findByTopicId(terra.topicId)?.qtyQuestionsCorrectAnswered()).toBe(1)
      expect(learning1.topics.findByTopicId(nomesCidades.topicId)?.qtyQuestionsCorrectAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(pronomes.topicId)?.qtyQuestionsCorrectAnswered()).toBe(2)
      expect(learning1.topics.findByTopicId(pessoais.topicId)?.qtyQuestionsCorrectAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(casoReto.topicId)?.qtyQuestionsCorrectAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(obliquos.topicId)?.qtyQuestionsCorrectAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(tratamento.topicId)?.qtyQuestionsCorrectAnswered()).toBe(0)
    })

    test("should calculate user qtyQuestionsAnswered of topic in discipline", () => {
      expect(learning1.topics.findByTopicId(portuguesClassificar.topicId)?.qtyQuestionsAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(crase.topicId)?.qtyQuestionsAnswered()).toBe(3)
      expect(learning1.topics.findByTopicId(palavrasRepetidas.topicId)?.qtyQuestionsAnswered()).toBe(1)
      expect(learning1.topics.findByTopicId(palavrasMasculinas.topicId)?.qtyQuestionsAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(palavrasEspeciais.topicId)?.qtyQuestionsAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(distancia.topicId)?.qtyQuestionsAnswered()).toBe(2)
      expect(learning1.topics.findByTopicId(terra.topicId)?.qtyQuestionsAnswered()).toBe(2)
      expect(learning1.topics.findByTopicId(nomesCidades.topicId)?.qtyQuestionsAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(pronomes.topicId)?.qtyQuestionsAnswered()).toBe(2)
      expect(learning1.topics.findByTopicId(pessoais.topicId)?.qtyQuestionsAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(casoReto.topicId)?.qtyQuestionsAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(obliquos.topicId)?.qtyQuestionsAnswered()).toBe(0)
      expect(learning1.topics.findByTopicId(tratamento.topicId)?.qtyQuestionsAnswered()).toBe(0)
    })

    test("should calculate user avgGrade of topic in discipline", () => {
      expect(learning1.topics.findByTopicId(portuguesClassificar.topicId)?.avgGrade()).toBe(null)
      expect(learning1.topics.findByTopicId(crase.topicId)?.avgGrade()).toBe(33.33)
      expect(learning1.topics.findByTopicId(palavrasRepetidas.topicId)?.avgGrade()).toBe(100)
      expect(learning1.topics.findByTopicId(palavrasMasculinas.topicId)?.avgGrade()).toBe(null)
      expect(learning1.topics.findByTopicId(palavrasEspeciais.topicId)?.avgGrade()).toBe(null)
      expect(learning1.topics.findByTopicId(distancia.topicId)?.avgGrade()).toBe(100)
      expect(learning1.topics.findByTopicId(terra.topicId)?.avgGrade()).toBe(50)
      expect(learning1.topics.findByTopicId(nomesCidades.topicId)?.avgGrade()).toBe(null)
      expect(learning1.topics.findByTopicId(pronomes.topicId)?.avgGrade()).toBe(100)
      expect(learning1.topics.findByTopicId(pessoais.topicId)?.avgGrade()).toBe(null)
      expect(learning1.topics.findByTopicId(casoReto.topicId)?.avgGrade()).toBe(null)
      expect(learning1.topics.findByTopicId(obliquos.topicId)?.avgGrade()).toBe(null)
      expect(learning1.topics.findByTopicId(tratamento.topicId)?.avgGrade()).toBe(null)
    })

    test("should calculate collectiveAvgGrade of topic in discipline", () => {
      expect(learning1.topics.findByTopicId(portuguesClassificar.topicId)?.collectiveAvgGrade).toBe(null)
      expect(learning1.topics.findByTopicId(crase.topicId)?.collectiveAvgGrade).toBe(54.16)
      expect(learning1.topics.findByTopicId(palavrasRepetidas.topicId)?.collectiveAvgGrade).toBe(null)
      expect(learning1.topics.findByTopicId(palavrasMasculinas.topicId)?.collectiveAvgGrade).toBe(null)
      expect(learning1.topics.findByTopicId(palavrasEspeciais.topicId)?.collectiveAvgGrade).toBe(null)
      expect(learning1.topics.findByTopicId(distancia.topicId)?.collectiveAvgGrade).toBe(null)
      expect(learning1.topics.findByTopicId(terra.topicId)?.collectiveAvgGrade).toBe(null)
      expect(learning1.topics.findByTopicId(nomesCidades.topicId)?.collectiveAvgGrade).toBe(null)
      expect(learning1.topics.findByTopicId(pronomes.topicId)?.collectiveAvgGrade).toBe(null)
      expect(learning1.topics.findByTopicId(pessoais.topicId)?.collectiveAvgGrade).toBe(null)
      expect(learning1.topics.findByTopicId(casoReto.topicId)?.collectiveAvgGrade).toBe(null)
      expect(learning1.topics.findByTopicId(obliquos.topicId)?.collectiveAvgGrade).toBe(null)
      expect(learning1.topics.findByTopicId(tratamento.topicId)?.collectiveAvgGrade).toBe(null)
    })

    test("should calculate collectiveAvgScore of topic in discipline", async () => {
      const fixture = await databaseFixture({
        userRepository,
        disciplineRepository,
        questionRepository,
        quizRepository,
        correctQuizAnswer,
      })
      userMember1 = fixture.userMember1
      userMember2 = fixture.userMember2
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

      learning1 = await getLearning.execute({
        disciplineId: portugues?.disciplineId,
        userId: userMember1.userId,
      })
      learning2 = await getLearning.execute({
        disciplineId: portugues?.disciplineId,
        userId: userMember2.userId,
      })
    })

    test("should calculate difficulty of topic in discipline", () => {
      expect(learning1.topics.findByTopicId(portuguesClassificar.topicId)?.difficulty).toBe(50)
      expect(learning1.topics.findByTopicId(crase.topicId)?.difficulty).toBe(45.84)
      expect(learning1.topics.findByTopicId(palavrasRepetidas.topicId)?.difficulty).toBe(50)
      expect(learning1.topics.findByTopicId(palavrasMasculinas.topicId)?.difficulty).toBe(50)
      expect(learning1.topics.findByTopicId(palavrasEspeciais.topicId)?.difficulty).toBe(50)
      expect(learning1.topics.findByTopicId(distancia.topicId)?.difficulty).toBe(50)
      expect(learning1.topics.findByTopicId(terra.topicId)?.difficulty).toBe(50)
      expect(learning1.topics.findByTopicId(nomesCidades.topicId)?.difficulty).toBe(50)
      expect(learning1.topics.findByTopicId(pronomes.topicId)?.difficulty).toBe(50)
      expect(learning1.topics.findByTopicId(pessoais.topicId)?.difficulty).toBe(50)
      expect(learning1.topics.findByTopicId(casoReto.topicId)?.difficulty).toBe(50)
      expect(learning1.topics.findByTopicId(obliquos.topicId)?.difficulty).toBe(50)
      expect(learning1.topics.findByTopicId(tratamento.topicId)?.difficulty).toBe(50)
    })

    test("should calculate difficultyRecursive of topic in discipline", () => {
      expect(learning1.topics.findByTopicId(portuguesClassificar.topicId)?.difficultyRecursive).toBe(50)
      expect(learning1.topics.findByTopicId(crase.topicId)?.difficultyRecursive).toBe(49.41)
      expect(learning1.topics.findByTopicId(palavrasRepetidas.topicId)?.difficultyRecursive).toBe(50)
      expect(learning1.topics.findByTopicId(palavrasMasculinas.topicId)?.difficultyRecursive).toBe(50)
      expect(learning1.topics.findByTopicId(palavrasEspeciais.topicId)?.difficultyRecursive).toBe(50)
      expect(learning1.topics.findByTopicId(distancia.topicId)?.difficultyRecursive).toBe(50)
      expect(learning1.topics.findByTopicId(terra.topicId)?.difficultyRecursive).toBe(50)
      expect(learning1.topics.findByTopicId(nomesCidades.topicId)?.difficultyRecursive).toBe(50)
      expect(learning1.topics.findByTopicId(pronomes.topicId)?.difficultyRecursive).toBe(50)
      expect(learning1.topics.findByTopicId(pessoais.topicId)?.difficultyRecursive).toBe(50)
      expect(learning1.topics.findByTopicId(casoReto.topicId)?.difficultyRecursive).toBe(50)
      expect(learning1.topics.findByTopicId(obliquos.topicId)?.difficultyRecursive).toBe(50)
      expect(learning1.topics.findByTopicId(tratamento.topicId)?.difficultyRecursive).toBe(50)
    })
  })
})
