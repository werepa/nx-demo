import { Discipline, Question, Quiz, Topic, User } from "../../domain/entity"
import { UserRole } from "../../domain/valueObject"
import { RoleEnum } from "../../shared/enum"
import { getCorrectOption, getIncorrectOption } from "../mocks"
import { CheckQuizAnswer } from "../../application/usecase"
import { DisciplineRepository, QuestionRepository, QuizRepository, UserRepository } from "../../application/repository"
import { DatabaseConnection } from "../../infra/database/DatabaseConnection"
import { DisciplineState, TopicState, UserState } from "../../shared/models"

type DbResultType<T> = {
  rows: T[]
  rowCount: number
  command?: string
  fields?: unknown[]
}

interface DatabaseFixture {
  users: UserState[]
  disciplines: DisciplineState[]
  topics: TopicState[]
}

export class TestDatabaseFixture {
  private static instance: TestDatabaseFixture
  private fixture: DatabaseFixture = {
    users: [],
    disciplines: [],
    topics: [],
  }

  private constructor(private readonly connection: DatabaseConnection) {}

  static getInstance(connection: DatabaseConnection): TestDatabaseFixture {
    if (!TestDatabaseFixture.instance) {
      TestDatabaseFixture.instance = new TestDatabaseFixture(connection)
    }
    return TestDatabaseFixture.instance
  }

  async loadUsers(): Promise<DbResultType<UserState>> {
    const result = await this.connection.query<UserState>("SELECT * FROM users")
    this.fixture.users = result.rows
    return result
  }

  async loadDisciplines(): Promise<DbResultType<DisciplineState>> {
    const result = await this.connection.query<DisciplineState>("SELECT * FROM disciplines")
    this.fixture.disciplines = result.rows
    return result
  }

  async loadTopics(): Promise<DbResultType<TopicState>> {
    const result = await this.connection.query<TopicState>("SELECT * FROM topics")
    this.fixture.topics = result.rows
    return result
  }

  async loadAll(): Promise<DatabaseFixture> {
    await Promise.all([this.loadUsers(), this.loadDisciplines(), this.loadTopics()])
    return this.fixture
  }

  async clearAll(): Promise<void> {
    if (this.connection.databaseType() === "postgres") {
      await this.connection.run("TRUNCATE TABLE users, disciplines, topics CASCADE")
    } else {
      await this.connection.run("DELETE FROM users")
      await this.connection.run("DELETE FROM disciplines")
      await this.connection.run("DELETE FROM topics")
    }
    this.fixture = {
      users: [],
      disciplines: [],
      topics: [],
    }
  }

  getFixture(): DatabaseFixture {
    return this.fixture
  }
}

export const databaseFixture = async ({
  userRepository,
  disciplineRepository,
  questionRepository,
  quizRepository,
  correctQuizAnswer,
  createQuizzes = true,
  databaseExtended = false,
}: {
  userRepository: UserRepository
  disciplineRepository: DisciplineRepository
  questionRepository: QuestionRepository
  quizRepository: QuizRepository
  correctQuizAnswer: CheckQuizAnswer
  createQuizzes?: boolean
  databaseExtended?: boolean
}) => {
  let acentuacaoGrafica: Topic = Topic.create({ name: "Acentuação Gráfica" })
  let concordanciaVerbal: Topic = Topic.create({ name: "Concordância Verbal" })
  let concordanciaNominal: Topic = Topic.create({ name: "Concordância Nominal" })
  let regenciaVerbal: Topic = Topic.create({ name: "Regência Verbal" })
  let regenciaNominal: Topic = Topic.create({ name: "Regência Nominal" })
  let pontuacao: Topic = Topic.create({ name: "Pontuação" })
  let fonetica: Topic = Topic.create({ name: "Fonética" })
  let morfologia: Topic = Topic.create({ name: "Morfologia" })
  let sintaxe: Topic = Topic.create({ name: "Sintaxe" })
  let semantica: Topic = Topic.create({ name: "Semântica" })
  let figurasDeLinguagem: Topic = Topic.create({ name: "Figuras de Linguagem" })

  // =================== Fixture User ===================

  await userRepository.clear()

  const userAdmin = User.create({
    name: "User Admin",
    email: "admin@simulex.com.br",
    password: "password1234",
  })
  userAdmin.updateRole(UserRole.create(RoleEnum.ADMIN))
  await userRepository.save(userAdmin)

  const userFree = User.create({
    name: "User Free",
    email: "free@simulex.com.br",
    password: "password1234",
  })
  await userRepository.save(userFree)

  const userTeacher = User.create({
    name: "User Teacher",
    email: "teacher@simulex.com.br",
    password: "password1234",
  })
  userTeacher.updateRole(UserRole.create(RoleEnum.TEACHER))
  await userRepository.save(userTeacher)

  const userMember1 = User.create({
    name: "User Member 1",
    email: "member1@simulex.com.br",
    password: "password1234",
  })
  userMember1.updateRole(UserRole.create(RoleEnum.MEMBER))
  await userRepository.save(userMember1)

  const userMember2 = User.create({
    name: "User Member 2",
    email: "member2@simulex.com.br",
    password: "password1234",
  })
  userMember2.updateRole(UserRole.create(RoleEnum.MEMBER))
  await userRepository.save(userMember2)

  const userInactive = User.create({
    name: "User Inactive",
    email: "inactive@simulex.com.br",
    password: "password1234",
  })
  userInactive.deactivate()
  await userRepository.save(userInactive)

  // =================== Fixture Discipline ===================

  await disciplineRepository.clear()

  // ---------- Direito Penal ----------
  let direitoPenal: Discipline | null = Discipline.create({ name: "Direito Penal" })

  const inqueritoPolicial = Topic.create({ name: "Inquérito Policial" })

  direitoPenal.topics.add(inqueritoPolicial)

  await disciplineRepository.save(direitoPenal)

  // ---------- Direito Constitucional ----------
  let direitoConstitucional: Discipline | null = Discipline.create({
    name: "Direito Constitucional",
  })

  const direitosGarantiasIndividuais = Topic.create({
    name: "Direitos e Garantias Individuais",
  })

  direitoConstitucional.topics.add(direitosGarantiasIndividuais)

  await disciplineRepository.save(direitoConstitucional)

  // ---------- Direito Administrativo ----------
  let direitoAdministrativo: Discipline | null = Discipline.create({
    name: "Direito Administrativo",
  })

  const poderesAdministrativos = Topic.create({
    name: "Poderes Administrativos",
  })
  const poderVinculado = Topic.create({ name: "Poder Vinculado" })
  const topicInactive = Topic.create({ name: "Topic Inactive" })

  topicInactive.deactivate()

  direitoAdministrativo.topics.add(poderesAdministrativos)
  direitoAdministrativo.topics.add(poderVinculado)
  direitoAdministrativo.topics.add(topicInactive)

  direitoAdministrativo.setTopicParent({
    topic: poderVinculado,
    topicParent: poderesAdministrativos,
  })

  await disciplineRepository.save(direitoAdministrativo)

  // ---------- Português ----------
  let portugues: Discipline | null = Discipline.create({ name: "Português" })
  const portuguesClassificar = portugues.topics.getItems()[0]

  const pronomes = Topic.create({ name: "Pronomes" })
  const pessoais = Topic.create({ name: "Pessoais" })
  const casoReto = Topic.create({ name: "Caso reto" })
  const obliquos = Topic.create({ name: "Oblíquos" })
  const tratamento = Topic.create({ name: "Tratamento" })
  const crase = Topic.create({ name: "Crase" })
  const palavrasRepetidas = Topic.create({ name: "Palavras repetidas" })
  const palavrasMasculinas = Topic.create({ name: "Palavras masculinas" })
  const palavrasEspeciais = Topic.create({ name: "Palavras especiais" })
  const distancia = Topic.create({ name: "Distância" })
  const terra = Topic.create({ name: "Terra" })
  const nomesCidades = Topic.create({ name: "Nomes de cidades" })

  portugues.topics.add(pronomes)
  portugues.topics.add(pessoais)
  portugues.topics.add(casoReto)
  portugues.topics.add(obliquos)
  portugues.topics.add(tratamento)
  portugues.topics.add(crase)
  portugues.topics.add(palavrasRepetidas)
  portugues.topics.add(palavrasMasculinas)
  portugues.topics.add(palavrasEspeciais)
  portugues.topics.add(distancia)
  portugues.topics.add(terra)
  portugues.topics.add(nomesCidades)

  portugues.setTopicParent({ topic: pessoais, topicParent: pronomes })
  portugues.setTopicParent({ topic: casoReto, topicParent: pessoais })
  portugues.setTopicParent({ topic: obliquos, topicParent: pessoais })
  portugues.setTopicParent({ topic: tratamento, topicParent: pronomes })
  portugues.setTopicParent({ topic: palavrasRepetidas, topicParent: crase })
  portugues.setTopicParent({ topic: palavrasMasculinas, topicParent: crase })
  portugues.setTopicParent({ topic: palavrasEspeciais, topicParent: crase })
  portugues.setTopicParent({
    topic: distancia,
    topicParent: palavrasEspeciais,
  })
  portugues.setTopicParent({ topic: terra, topicParent: palavrasEspeciais })
  portugues.setTopicParent({ topic: nomesCidades, topicParent: crase })

  if (databaseExtended) {
    acentuacaoGrafica = Topic.create({ name: "Acentuação Gráfica" })
    concordanciaVerbal = Topic.create({ name: "Concordância Verbal" })
    concordanciaNominal = Topic.create({ name: "Concordância Nominal" })
    regenciaVerbal = Topic.create({ name: "Regência Verbal" })
    regenciaNominal = Topic.create({ name: "Regência Nominal" })
    pontuacao = Topic.create({ name: "Pontuação" })
    fonetica = Topic.create({ name: "Fonética" })
    morfologia = Topic.create({ name: "Morfologia" })
    sintaxe = Topic.create({ name: "Sintaxe" })
    semantica = Topic.create({ name: "Semântica" })
    figurasDeLinguagem = Topic.create({ name: "Figuras de Linguagem" })

    portugues.topics.add(acentuacaoGrafica)
    portugues.topics.add(concordanciaVerbal)
    portugues.topics.add(concordanciaNominal)
    portugues.topics.add(regenciaVerbal)
    portugues.topics.add(regenciaNominal)
    portugues.topics.add(pontuacao)
    portugues.topics.add(fonetica)
    portugues.topics.add(morfologia)
    portugues.topics.add(sintaxe)
    portugues.topics.add(semantica)
    portugues.topics.add(figurasDeLinguagem)
  }

  await disciplineRepository.save(portugues)

  // ---------- História Geral ----------
  let historia: Discipline | null = Discipline.create({ name: "História Geral" })

  historia.deactivate()

  await disciplineRepository.save(historia)

  // =================== Fixture Question ===================

  await questionRepository.clear()

  const questionInactive = Question.create({
    topicId: crase.topicId,
    topicRootId: crase.topicRootId,
    prompt: "Questão inativa",
    options: [{ text: "inativa" }],
  })
  questionInactive.deactivate()

  await questionRepository.save(questionInactive)

  const createQuestion = async (topic: Topic, qtde: number) => {
    if (!topic) return
    for (let i = 0; i < qtde; i++) {
      if (Math.random() > 0.5) {
        const options = [
          { text: "alternativa 1", isCorrectAnswer: false },
          { text: "alternativa 2", isCorrectAnswer: false },
          { text: "alternativa 3", isCorrectAnswer: false },
          { text: "alternativa 4", isCorrectAnswer: false },
          { text: "alternativa 5", isCorrectAnswer: false },
        ]
        const isCorrectAnswer = Math.floor(Math.random() * 5)
        options[isCorrectAnswer].isCorrectAnswer = true

        const question = Question.create({
          topicId: topic.topicId,
          topicRootId: topic.topicRootId,
          prompt: `Questão ${i + 1} - ${topic.name}`,
          options,
        })
        await questionRepository.save(question)
      } else {
        const question = Question.create({
          topicId: topic.topicId,
          topicRootId: topic.topicRootId,
          prompt: `Questão ${i + 1} - ${topic.name}`,
          options: [{ text: "alternativa verdadeira", isCorrectAnswer: true }],
        })
        await questionRepository.save(question)
      }
    }
  }

  await createQuestion(portuguesClassificar, 1)
  await createQuestion(crase, 4)
  await createQuestion(palavrasRepetidas, 1)
  await createQuestion(palavrasMasculinas, 1)
  await createQuestion(palavrasEspeciais, 0)
  await createQuestion(distancia, 2)
  await createQuestion(terra, 3)
  await createQuestion(nomesCidades, 0)
  await createQuestion(pronomes, 3)
  await createQuestion(pessoais, 0)
  await createQuestion(casoReto, 3)
  await createQuestion(obliquos, 1)
  await createQuestion(tratamento, 2)
  await createQuestion(inqueritoPolicial, 0)
  await createQuestion(direitosGarantiasIndividuais, 0)
  await createQuestion(poderesAdministrativos, 2)
  await createQuestion(poderVinculado, 1)

  if (databaseExtended) {
    await createQuestion(portuguesClassificar, 4)
    await createQuestion(crase, 6)
    await createQuestion(palavrasRepetidas, 4)
    await createQuestion(palavrasMasculinas, 4)
    await createQuestion(palavrasEspeciais, 0)
    await createQuestion(distancia, 4)
    await createQuestion(terra, 5)
    await createQuestion(nomesCidades, 5)
    await createQuestion(pronomes, 7)
    await createQuestion(pessoais, 5)
    await createQuestion(casoReto, 3)
    await createQuestion(obliquos, 4)
    await createQuestion(tratamento, 3)
    await createQuestion(inqueritoPolicial, 5)
    await createQuestion(direitosGarantiasIndividuais, 7)
    await createQuestion(poderesAdministrativos, 5)
    await createQuestion(poderVinculado, 5)
    await createQuestion(acentuacaoGrafica, 5)
    await createQuestion(concordanciaVerbal, 5)
    await createQuestion(concordanciaNominal, 5)
    await createQuestion(regenciaVerbal, 5)
    await createQuestion(regenciaNominal, 5)
    await createQuestion(pontuacao, 5)
    await createQuestion(fonetica, 5)
    await createQuestion(morfologia, 5)
    await createQuestion(sintaxe, 5)
    await createQuestion(semantica, 5)
    await createQuestion(figurasDeLinguagem, 5)
  }

  // =================== Fixture Quiz ===================
  if (createQuizzes) {
    await quizRepository.clear()

    const answers = [
      { user: userMember1, topic: crase, correctAnswer: false },
      { user: userMember1, topic: crase, correctAnswer: true },
      { user: userMember1, topic: crase, correctAnswer: false },
      { user: userMember1, topic: palavrasRepetidas, correctAnswer: true },
      { user: userMember1, topic: distancia, correctAnswer: true },
      { user: userMember1, topic: distancia, correctAnswer: true },
      { user: userMember1, topic: terra, correctAnswer: false },
      { user: userMember1, topic: terra, correctAnswer: true },
      { user: userMember1, topic: pronomes, correctAnswer: true },
      { user: userMember1, topic: pronomes, correctAnswer: true },
      { user: userMember2, topic: crase, correctAnswer: true },
      { user: userMember2, topic: crase, correctAnswer: true },
      { user: userMember2, topic: crase, correctAnswer: false },
      { user: userMember2, topic: crase, correctAnswer: true },
      { user: userMember2, topic: palavrasRepetidas, correctAnswer: true },
      { user: userMember2, topic: distancia, correctAnswer: true },
      { user: userMember2, topic: terra, correctAnswer: false },
      { user: userMember2, topic: pronomes, correctAnswer: true },
    ]

    const uniqueUserIds = Array.from(new Set(answers.map((answer) => answer.user)))

    for (const user of uniqueUserIds) {
      await processUser(user, portugues, quizRepository, questionRepository, correctQuizAnswer, answers)
    }
  }

  // =================== Disciplines ===================

  portugues = await disciplineRepository.getById(portugues.disciplineId)
  historia = await disciplineRepository.getById(historia.disciplineId)
  direitoPenal = await disciplineRepository.getById(direitoPenal.disciplineId)
  direitoConstitucional = await disciplineRepository.getById(direitoConstitucional.disciplineId)
  direitoAdministrativo = await disciplineRepository.getById(direitoAdministrativo.disciplineId)

  return {
    userFree,
    userTeacher,
    userMember1,
    userMember2,
    userInactive,
    userAdmin,
    direitoPenal,
    direitoConstitucional,
    direitoAdministrativo,
    historia,
    portugues,
    portuguesClassificar,
    pronomes,
    pessoais,
    casoReto,
    obliquos,
    tratamento,
    crase,
    palavrasRepetidas,
    palavrasMasculinas,
    palavrasEspeciais,
    distancia,
    terra,
    nomesCidades,
    acentuacaoGrafica,
    concordanciaVerbal,
    concordanciaNominal,
    regenciaVerbal,
    regenciaNominal,
    pontuacao,
    fonetica,
    morfologia,
    sintaxe,
    semantica,
    figurasDeLinguagem,
    inqueritoPolicial,
    direitosGarantiasIndividuais,
    poderesAdministrativos,
    poderVinculado,
    topicInactive,
  }
}

async function processUser(
  user: User,
  discipline: Discipline,
  quizRepository: QuizRepository,
  questionRepository: QuestionRepository,
  correctQuizAnswer: CheckQuizAnswer,
  answers: any
) {
  const topicsRoot: Topic[] = Array.from(
    new Set(answers.filter((answer: any) => answer.topic.isRoot()).map((answer: any) => answer.topic as Topic))
  )
  const quiz = createQuiz(user, discipline, topicsRoot)
  await quizRepository.save(quiz)

  const questions = await questionRepository.getAll()
  await processAnswers(user, discipline, quiz, questions, correctQuizAnswer, answers)
}

function createQuiz(user: any, discipline: any, topics: Topic[]): Quiz {
  const quiz = Quiz.create({
    user,
    discipline,
  })
  topics.forEach((topic: Topic) => {
    quiz.topicsRoot.add(topic)
  })
  return quiz
}

async function processAnswers(
  user: User,
  discipline: Discipline,
  quiz: Quiz,
  questions: Question[],
  correctQuizAnswer: CheckQuizAnswer,
  answers: any
) {
  const userAnswers = answers.filter((answer: any) => answer.user.userId === user.userId)
  for (const answer of userAnswers) {
    const question = questions.find((q) => q.topicId === answer.topic.topicId)
    if (question) {
      // if (answer.topic.name === "Crase") {
      //   console.log(learning.topics.findByTopicId(answer.topic.topicId).topicLearningId)
      // }
      await correctQuizAnswer.execute({
        disciplineId: discipline.disciplineId,
        userId: user.userId,
        userQuizAnswer: {
          quizId: quiz.id,
          questionId: question.questionId,
          userOptionId: answer.correctAnswer ? getCorrectOption(question) : getIncorrectOption(question),
          topicId: question.topicId,
        },
      })
      questions = questions.filter((q) => q.questionId !== question.questionId)
    }
  }
}
