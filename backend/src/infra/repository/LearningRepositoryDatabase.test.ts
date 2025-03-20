import { User } from "../../domain/entity/User"
import { Discipline } from "../../domain/entity/Discipline"
import { Topic } from "../../domain/entity/Topic"
import { databaseFixture } from "../../tests/fixtures/databaseFixture"
import { CheckQuizAnswer } from "../../application/usecase/CheckQuizAnswer/CheckQuizAnswer"
import { DisciplineRepository } from "../../application/repository/DisciplineRepository"
import { LearningRepository } from "../../application/repository/LearningRepository"
import { QuestionRepository } from "../../application/repository/QuestionRepository"
import { QuizRepository } from "../../application/repository/QuizRepository"
import { UserRepository } from "../../application/repository/UserRepository"
import { DatabaseConnection } from "../database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../database/TestDatabaseAdapter"
import { DisciplineRepositoryDatabase } from "./DisciplineRepositoryDatabase"
import { UserRepositoryDatabase } from "./UserRepositoryDatabase"
import { LearningRepositoryDatabase } from "./LearningRepositoryDatabase"
import { QuestionRepositoryDatabase } from "./QuestionRepositoryDatabase"
import { QuizRepositoryDatabase } from "./QuizRepositoryDatabase"

describe("LearningRepositoryDatabase", () => {
  let connection: DatabaseConnection
  let disciplineRepository: DisciplineRepository
  let userRepository: UserRepository
  let questionRepository: QuestionRepository
  let quizRepository: QuizRepository
  let learningRepository: LearningRepository

  let correctQuizAnswer: CheckQuizAnswer

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

  beforeEach(async () => {
    connection = getTestDatabaseAdapter()

    userRepository = new UserRepositoryDatabase(connection)
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)
    quizRepository = new QuizRepositoryDatabase(
      connection,
      userRepository,
      disciplineRepository,
    )
    learningRepository = new LearningRepositoryDatabase(connection)

    await learningRepository.clear()
    await quizRepository.clear()
    await questionRepository.clear()
    await disciplineRepository.clear()
    await userRepository.clear()

    correctQuizAnswer = new CheckQuizAnswer(
      userRepository,
      disciplineRepository,
      questionRepository,
      quizRepository,
      learningRepository,
    )

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
  })

  afterEach(() => {
    connection.close()
  })

  test("should return an user learning", async () => {
    const learning = await learningRepository.getDisciplineLearning(
      userMember1,
      portugues,
    )
    const craseLearning = learning?.topics.findByTopicId(crase.topicId)
    expect(learning?.topics.getCount()).toBe(13)
    expect(learning?.history.getCount()).toBe(10)
    expect(craseLearning?.history.getCount()).toBe(3)
  })

  describe("User TopicLearning", () => {
    test("should return an user topic learning", async () => {
      let learning = await learningRepository.getDisciplineLearning(
        userMember1,
        portugues,
      )
      let craseLearning = learning?.topics.findByTopicId(crase.topicId)
      expect(learning?.topics.getCount()).toBe(13)
      expect(craseLearning?.topic.name).toBe("Crase")
      expect(craseLearning?.history.getCount()).toBe(3)
      expect(craseLearning?.qtyQuestionsCorrectAnswered()).toBe(1)
      expect(craseLearning?.qtyQuestionsAnswered()).toBe(3)
      expect(craseLearning?.isLastQuestionCorrectAnswered()).toBe(false)
      expect(craseLearning?.avgGrade()).toBe(33.33)
      expect(craseLearning?.score()).toBe(0)
      expect(craseLearning?.collectiveAvgGrade).toBe(54.16)

      learning = await learningRepository.getDisciplineLearning(
        userMember2,
        portugues,
      )
      craseLearning = learning?.topics.findByTopicId(crase.topicId)
      expect(learning?.topics.getCount()).toBe(13)
      expect(craseLearning?.topic.name).toBe("Crase")
      expect(craseLearning?.history.getCount()).toBe(4)
      expect(craseLearning?.qtyQuestionsCorrectAnswered()).toBe(3)
      expect(craseLearning?.qtyQuestionsAnswered()).toBe(4)
      expect(craseLearning?.isLastQuestionCorrectAnswered()).toBe(true)
      expect(craseLearning?.avgGrade()).toBe(75)
      expect(craseLearning?.score()).toBe(1)
      expect(craseLearning?.collectiveAvgGrade).toBe(54.16)
    })
  })
})
