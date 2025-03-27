import { GetLearning } from "../application/usecase/GetLearning/GetLearning"
import { CheckQuizAnswer } from "../application/usecase/CheckQuizAnswer/CheckQuizAnswer"
import { CreateQuiz } from "../application/usecase/CreateQuiz/CreateQuiz"
import { User } from "../domain/entity/User"
import { Discipline } from "../domain/entity/Discipline"
import { Topic } from "../domain/entity/Topic"
import { Learning } from "../domain/entity/Learning"
import { Quiz } from "../domain/entity/Quiz"
import { Question } from "../domain/entity/Question"
import { databaseFixture } from "./fixtures/databaseFixture"
import { GetNextQuestion } from "../application/usecase/GetNextQuestion/GetNextQuestion"
import { getCorrectOption, getIncorrectOption } from "./mocks"
import { DatabaseConnection } from "../infra/database/DatabaseConnection"
import { getTestDatabaseAdapter } from "../infra/database/TestDatabaseAdapter"
import { DisciplineRepository } from "../application/repository/DisciplineRepository"
import { LearningRepository } from "../application/repository/LearningRepository"
import { QuestionRepository } from "../application/repository/QuestionRepository"
import { QuizRepository } from "../application/repository/QuizRepository"
import { UserRepository } from "../application/repository/UserRepository"
import { DisciplineRepositoryDatabase } from "../infra/repository/DisciplineRepositoryDatabase"
import { LearningRepositoryDatabase } from "../infra/repository/LearningRepositoryDatabase"
import { QuestionRepositoryDatabase } from "../infra/repository/QuestionRepositoryDatabase"
import { QuizRepositoryDatabase } from "../infra/repository/QuizRepositoryDatabase"
import { UserRepositoryDatabase } from "../infra/repository/UserRepositoryDatabase"
import { GetQuizById } from "../application/usecase"

describe("Simulex", () => {
  let connection: DatabaseConnection
  let userRepository: UserRepository
  let disciplineRepository: DisciplineRepository
  let questionRepository: QuestionRepository
  let quizRepository: QuizRepository
  let learningRepository: LearningRepository

  let getLearning: GetLearning
  let getNextQuestion: GetNextQuestion
  let correctQuizAnswer: CheckQuizAnswer
  let createQuiz: CreateQuiz
  let getQuizById: GetQuizById

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
  let acentuacaoGrafica: Topic
  let concordanciaVerbal: Topic
  let concordanciaNominal: Topic
  let regenciaVerbal: Topic
  let regenciaNominal: Topic
  let pontuacao: Topic
  let fonetica: Topic
  let morfologia: Topic
  let sintaxe: Topic
  let semantica: Topic
  let figurasDeLinguagem: Topic

  let quiz1: Quiz
  let learning1: Learning

  beforeAll(() => {
    connection = getTestDatabaseAdapter()

    userRepository = new UserRepositoryDatabase(connection)
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)
    quizRepository = new QuizRepositoryDatabase(connection, userRepository, disciplineRepository)
    learningRepository = new LearningRepositoryDatabase(connection)

    // UseCases
    getLearning = new GetLearning(disciplineRepository, userRepository, learningRepository)

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
      databaseExtended: true,
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
    acentuacaoGrafica = fixture.acentuacaoGrafica
    concordanciaVerbal = fixture.concordanciaVerbal
    concordanciaNominal = fixture.concordanciaNominal
    regenciaVerbal = fixture.regenciaVerbal
    regenciaNominal = fixture.regenciaNominal
    pontuacao = fixture.pontuacao
    fonetica = fixture.fonetica
    morfologia = fixture.morfologia
    sintaxe = fixture.sintaxe
    semantica = fixture.semantica
    figurasDeLinguagem = fixture.figurasDeLinguagem
  })
  afterAll(() => {
    connection.close()
  })

  describe("Fixtures", () => {
    test("should have questions to tests", async () => {
      learning1 = await getLearning.execute({
        userId: userMember1.userId,
        disciplineId: portugues.disciplineId,
      })
      expect(learning1.topic(portuguesClassificar.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(crase.topicId).qtyQuestions).toBe(10)
      expect(learning1.topic(palavrasRepetidas.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(palavrasMasculinas.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(palavrasEspeciais.topicId).qtyQuestions).toBe(0)
      expect(learning1.topic(distancia.topicId).qtyQuestions).toBe(6)
      expect(learning1.topic(terra.topicId).qtyQuestions).toBe(8)
      expect(learning1.topic(nomesCidades.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(pronomes.topicId).qtyQuestions).toBe(10)
      expect(learning1.topic(pessoais.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(casoReto.topicId).qtyQuestions).toBe(6)
      expect(learning1.topic(obliquos.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(tratamento.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(acentuacaoGrafica.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(concordanciaVerbal.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(concordanciaNominal.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(regenciaVerbal.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(regenciaNominal.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(pontuacao.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(fonetica.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(morfologia.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(sintaxe.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(semantica.topicId).qtyQuestions).toBe(5)
      expect(learning1.topic(figurasDeLinguagem.topicId).qtyQuestions).toBe(5)

      expect(learning1.topic(crase.topicId).frequencyInDiscipline).toBe(1)
      expect(learning1.topic(pronomes.topicId).frequencyInDiscipline).toBe(0.7949)
      expect(learning1.topic(pessoais.topicId).frequencyInDiscipline).toBe(0.4103)
      expect(learning1.topic(palavrasEspeciais.topicId).frequencyInDiscipline).toBe(0.359)
      expect(learning1.topic(terra.topicId).frequencyInDiscipline).toBe(0.2051)
      expect(learning1.topic(casoReto.topicId).frequencyInDiscipline).toBe(0.1538)
      expect(learning1.topic(distancia.topicId).frequencyInDiscipline).toBe(0.1538)
      expect(learning1.topic(acentuacaoGrafica.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(concordanciaNominal.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(concordanciaVerbal.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(figurasDeLinguagem.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(fonetica.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(morfologia.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(nomesCidades.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(obliquos.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(palavrasMasculinas.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(palavrasRepetidas.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(pontuacao.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(portuguesClassificar.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(regenciaNominal.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(regenciaVerbal.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(semantica.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(sintaxe.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(tratamento.topicId).frequencyInDiscipline).toBe(0.1282)
    })
  })

  describe("Create user", () => {
    test("should create a free user ", async () => {
      const user = User.create({
        name: "New User",
        email: "newuser@simulex.com.br",
        password: "asdf1234",
      })
      expect(user).toBeInstanceOf(User)
    })
  })

  describe("Create quiz", () => {
    test("should create a quiz", async () => {
      const { quizId } = await createQuiz.execute({
        userId: userMember1.userId,
        disciplineId: portugues.disciplineId,
        topicsRoot: [crase.topicId, pronomes.topicId],
      })
      quiz1 = await getQuizById.execute(quizId)
      expect(quiz1).toBeInstanceOf(Quiz)
    })
  })

  xdescribe("Answer quiz - Leveling phase and Quiz by Frequency", () => {
    const verifyNextQuestion = async (expectedTopic: Topic, correctAnswered = true) => {
      if (!expectedTopic) {
        expect(expectedTopic).toBeDefined()
        return
      }
      const nextQuestion = await getNextQuestion.execute({
        quizId: quiz1.quizId,
        randomWait: -5, // Apenas para testes
      })

      if (nextQuestion.topicId !== expectedTopic.topicId) {
        console.log("expectedTopic:", expectedTopic.name)
      }

      expect(nextQuestion).toBeInstanceOf(Question)
      expect(nextQuestion.topicId).toBe(expectedTopic.topicId)

      await correctQuizAnswer.execute({
        disciplineId: portugues.disciplineId,
        userId: userMember1.userId,
        userQuizAnswer: {
          quizId: quiz1.quizId,
          questionId: nextQuestion.questionId,
          userOptionId: correctAnswered ? getCorrectOption(nextQuestion) : getIncorrectOption(nextQuestion),
          topicId: nextQuestion.topicId,
        },
      })
      learning1 = await getLearning.execute({
        userId: userMember1.userId,
        disciplineId: portugues.disciplineId,
      })
    }

    test("should answer a quiz", async () => {
      const { quizId } = await createQuiz.execute({
        userId: userMember1.userId,
        disciplineId: portugues.disciplineId,
        topicsRoot: [
          crase.topicId,
          pronomes.topicId,
          acentuacaoGrafica.topicId,
          concordanciaVerbal.topicId,
          concordanciaNominal.topicId,
          regenciaVerbal.topicId,
          regenciaNominal.topicId,
          pontuacao.topicId,
          fonetica.topicId,
          morfologia.topicId,
          sintaxe.topicId,
          semantica.topicId,
          figurasDeLinguagem.topicId,
        ],
      })
      quiz1 = await getQuizById.execute(quizId)

      learning1 = await getLearning.execute({
        userId: userMember1.userId,
        disciplineId: portugues.disciplineId,
      })
      expect(learning1.topic(crase.topicId).qtyQuestionsAnswered()).toBe(0)
      expect(learning1.topic(pronomes.topicId).qtyQuestionsAnswered()).toBe(0)

      expect(learning1.topic(crase.topicId).frequencyInDiscipline).toBe(1)
      expect(learning1.topic(casoReto.topicId).frequencyInDiscipline).toBe(0.1538)

      // Primeira rodada - Início da fase de nivelamento
      await verifyNextQuestion(crase)
      await verifyNextQuestion(pronomes, false)
      await verifyNextQuestion(pessoais, false)
      await verifyNextQuestion(terra)
      await verifyNextQuestion(casoReto, false)
      await verifyNextQuestion(distancia, false)
      await verifyNextQuestion(acentuacaoGrafica)
      await verifyNextQuestion(concordanciaNominal)
      await verifyNextQuestion(concordanciaVerbal)
      await verifyNextQuestion(figurasDeLinguagem)
      await verifyNextQuestion(fonetica)
      await verifyNextQuestion(morfologia)
      await verifyNextQuestion(nomesCidades)
      await verifyNextQuestion(obliquos)
      await verifyNextQuestion(palavrasMasculinas)
      await verifyNextQuestion(palavrasRepetidas)
      await verifyNextQuestion(pontuacao)
      await verifyNextQuestion(regenciaNominal)
      await verifyNextQuestion(regenciaVerbal)
      await verifyNextQuestion(semantica)
      await verifyNextQuestion(sintaxe)
      await verifyNextQuestion(tratamento)

      expect(learning1.topic(crase.topicId).score()).toBe(1)
      expect(learning1.topic(pronomes.topicId).score()).toBe(0)
      expect(learning1.topic(pessoais.topicId).score()).toBe(0)
      expect(learning1.topic(terra.topicId).score()).toBe(1)
      expect(learning1.topic(casoReto.topicId).score()).toBe(0)
      expect(learning1.topic(distancia.topicId).score()).toBe(0)
      expect(learning1.topic(acentuacaoGrafica.topicId).score()).toBe(1)
      expect(learning1.topic(concordanciaNominal.topicId).score()).toBe(1)
      expect(learning1.topic(concordanciaVerbal.topicId).score()).toBe(1)
      expect(learning1.topic(figurasDeLinguagem.topicId).score()).toBe(1)
      expect(learning1.topic(fonetica.topicId).score()).toBe(1)
      expect(learning1.topic(morfologia.topicId).score()).toBe(1)
      expect(learning1.topic(nomesCidades.topicId).score()).toBe(1)
      expect(learning1.topic(obliquos.topicId).score()).toBe(1)
      expect(learning1.topic(palavrasMasculinas.topicId).score()).toBe(1)
      expect(learning1.topic(palavrasRepetidas.topicId).score()).toBe(1)
      expect(learning1.topic(pontuacao.topicId).score()).toBe(1)
      expect(learning1.topic(regenciaNominal.topicId).score()).toBe(1)
      expect(learning1.topic(regenciaVerbal.topicId).score()).toBe(1)
      expect(learning1.topic(semantica.topicId).score()).toBe(1)
      expect(learning1.topic(sintaxe.topicId).score()).toBe(1)
      expect(learning1.topic(tratamento.topicId).score()).toBe(1)

      // Segunda rodada - fase de nivelamento
      await verifyNextQuestion(pronomes)
      await verifyNextQuestion(pessoais)
      await verifyNextQuestion(casoReto, false)
      await verifyNextQuestion(distancia, false)
      await verifyNextQuestion(crase, false)
      await verifyNextQuestion(terra)
      await verifyNextQuestion(acentuacaoGrafica, false)
      await verifyNextQuestion(concordanciaNominal, false)
      await verifyNextQuestion(concordanciaVerbal, false)
      await verifyNextQuestion(figurasDeLinguagem, false)
      await verifyNextQuestion(fonetica, false)
      await verifyNextQuestion(morfologia, false)
      await verifyNextQuestion(nomesCidades, false)
      await verifyNextQuestion(obliquos, false)
      await verifyNextQuestion(palavrasMasculinas, false)
      await verifyNextQuestion(palavrasRepetidas, false)
      await verifyNextQuestion(pontuacao, false)
      await verifyNextQuestion(regenciaNominal, false)
      await verifyNextQuestion(regenciaVerbal, false)
      await verifyNextQuestion(semantica, false)
      await verifyNextQuestion(sintaxe, false)
      await verifyNextQuestion(tratamento, false)

      // // 0 a 7 (0: não verificado, 1: em análise, 2: iniciante, 3: leigo, 4: aprendiz, 5: bacharel, 6: mestre, 7: doutor)
      expect(learning1.topic(casoReto.topicId).learningLabel()).toBe("Iniciante")
      expect(learning1.topic(distancia.topicId).learningLabel()).toBe("Iniciante")
      expect(learning1.topic(crase.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(pronomes.topicId).learningLabel()).toBe("Aprendiz")
      expect(learning1.topic(pessoais.topicId).learningLabel()).toBe("Aprendiz")
      expect(learning1.topic(terra.topicId).learningLabel()).toBe("Bacharel")
      expect(learning1.topic(acentuacaoGrafica.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(concordanciaNominal.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(concordanciaVerbal.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(figurasDeLinguagem.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(fonetica.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(morfologia.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(nomesCidades.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(obliquos.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(palavrasMasculinas.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(palavrasRepetidas.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(pontuacao.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(regenciaNominal.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(regenciaVerbal.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(semantica.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(sintaxe.topicId).learningLabel()).toBe("Leigo")
      expect(learning1.topic(tratamento.topicId).learningLabel()).toBe("Leigo")

      expect(learning1.topic(crase.topicId).frequencyInDiscipline).toBe(1)
      expect(learning1.topic(pronomes.topicId).frequencyInDiscipline).toBe(0.7949)
      expect(learning1.topic(pessoais.topicId).frequencyInDiscipline).toBe(0.4103)
      expect(learning1.topic(palavrasEspeciais.topicId).frequencyInDiscipline).toBe(0.359)
      expect(learning1.topic(terra.topicId).frequencyInDiscipline).toBe(0.2051)
      expect(learning1.topic(casoReto.topicId).frequencyInDiscipline).toBe(0.1538)
      expect(learning1.topic(distancia.topicId).frequencyInDiscipline).toBe(0.1538)
      expect(learning1.topic(acentuacaoGrafica.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(concordanciaNominal.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(concordanciaVerbal.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(figurasDeLinguagem.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(fonetica.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(morfologia.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(nomesCidades.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(obliquos.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(palavrasMasculinas.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(palavrasRepetidas.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(pontuacao.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(portuguesClassificar.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(regenciaNominal.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(regenciaVerbal.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(semantica.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(sintaxe.topicId).frequencyInDiscipline).toBe(0.1282)
      expect(learning1.topic(tratamento.topicId).frequencyInDiscipline).toBe(0.1282)

      // Terceira rodada - Início da fase de aprendizado (Iniciante e Leigo)
      await verifyNextQuestion(crase)
      expect(learning1.topic(crase.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(casoReto, false)
      expect(learning1.topic(casoReto.topicId).learningLabel()).toBe("Iniciante")

      await verifyNextQuestion(distancia)
      expect(learning1.topic(distancia.topicId).learningLabel()).toBe("Leigo")

      await verifyNextQuestion(acentuacaoGrafica, false)
      expect(learning1.topic(acentuacaoGrafica.topicId).learningLabel()).toBe("Leigo")

      await verifyNextQuestion(concordanciaNominal, false)
      expect(learning1.topic(concordanciaNominal.topicId).learningLabel()).toBe("Leigo")

      await verifyNextQuestion(concordanciaVerbal, false)
      expect(learning1.topic(concordanciaVerbal.topicId).learningLabel()).toBe("Leigo")

      await verifyNextQuestion(figurasDeLinguagem, false)
      expect(learning1.topic(figurasDeLinguagem.topicId).learningLabel()).toBe("Leigo")

      await verifyNextQuestion(casoReto)
      expect(learning1.topic(casoReto.topicId).learningLabel()).toBe("Leigo")

      await verifyNextQuestion(distancia)
      expect(learning1.topic(distancia.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(fonetica)
      expect(learning1.topic(fonetica.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(morfologia)
      expect(learning1.topic(morfologia.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(nomesCidades, false)
      expect(learning1.topic(nomesCidades.topicId).learningLabel()).toBe("Leigo")

      await verifyNextQuestion(obliquos, false)
      expect(learning1.topic(obliquos.topicId).learningLabel()).toBe("Leigo")

      await verifyNextQuestion(casoReto, false)
      expect(learning1.topic(casoReto.topicId).learningLabel()).toBe("Leigo")

      await verifyNextQuestion(palavrasMasculinas, false)
      expect(learning1.topic(palavrasMasculinas.topicId).learningLabel()).toBe("Leigo")

      await verifyNextQuestion(palavrasRepetidas, false)
      expect(learning1.topic(palavrasRepetidas.topicId).learningLabel()).toBe("Leigo")

      await verifyNextQuestion(pontuacao)
      expect(learning1.topic(pontuacao.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(regenciaNominal)
      expect(learning1.topic(regenciaNominal.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(regenciaVerbal)
      expect(learning1.topic(regenciaVerbal.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(casoReto)
      expect(learning1.topic(casoReto.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(semantica)
      expect(learning1.topic(semantica.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(sintaxe)
      expect(learning1.topic(sintaxe.topicId).learningLabel()).toBe("Aprendiz")

      // // Quarta rodada - Início da fase de aprendizado (Leigo e Aprendiz)

      await verifyNextQuestion(crase, false)
      expect(learning1.topic(crase.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(pronomes)
      expect(learning1.topic(pronomes.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(pessoais)
      expect(learning1.topic(pessoais.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(casoReto)
      expect(learning1.topic(casoReto.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(distancia)
      expect(learning1.topic(distancia.topicId).learningLabel()).toBe("Bacharel")

      await verifyNextQuestion(tratamento)
      expect(learning1.topic(tratamento.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(crase)
      expect(learning1.topic(crase.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(pronomes)
      expect(learning1.topic(pronomes.topicId).learningLabel()).toBe("Bacharel")

      await verifyNextQuestion(pessoais)
      expect(learning1.topic(pessoais.topicId).learningLabel()).toBe("Bacharel")

      await verifyNextQuestion(casoReto)
      expect(learning1.topic(casoReto.topicId).learningLabel()).toBe("Mestre")

      await verifyNextQuestion(acentuacaoGrafica)
      expect(learning1.topic(acentuacaoGrafica.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(concordanciaNominal)
      expect(learning1.topic(concordanciaNominal.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(crase)
      expect(learning1.topic(crase.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(concordanciaVerbal)
      expect(learning1.topic(concordanciaVerbal.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(figurasDeLinguagem)
      expect(learning1.topic(figurasDeLinguagem.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(nomesCidades)
      expect(learning1.topic(nomesCidades.topicId).learningLabel()).toBe("Aprendiz")

      await verifyNextQuestion(obliquos)
      expect(learning1.topic(obliquos.topicId).learningLabel()).toBe("Aprendiz")
    }, 60000)

    test("should recycle questions and ignore randomWait if necessary", async () => {
      const { quizId } = await createQuiz.execute({
        userId: userMember1.userId,
        disciplineId: portugues.disciplineId,
        topicsRoot: [pontuacao.topicId],
      })
      quiz1 = await getQuizById.execute(quizId)

      learning1 = await getLearning.execute({
        userId: userMember1.userId,
        disciplineId: portugues.disciplineId,
      })

      // Primeira rodada - fase de nivelamento
      await verifyNextQuestion(pontuacao)

      // Segunda rodada - fase de nivelamento
      await verifyNextQuestion(pontuacao)

      // Terceira rodada - fase de aprendizado

      await verifyNextQuestion(pontuacao)
      await verifyNextQuestion(pontuacao)
      await verifyNextQuestion(pontuacao)
      await verifyNextQuestion(pontuacao) // Reset canRepeat
      await verifyNextQuestion(pontuacao)
      await verifyNextQuestion(pontuacao)
      await verifyNextQuestion(pontuacao)
      await verifyNextQuestion(pontuacao)
      await verifyNextQuestion(pontuacao) // Reset canRepeat
    })
  })
})
