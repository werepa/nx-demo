import { Entity } from "../../shared/domain/entity"
import { DateBr } from "../../shared/domain/valueObject"
import { Topic } from "./Topic"
import { QuizAnswerList } from "./QuizAnswerList"
import { QuizAnswer } from "./QuizAnswer"
import { Learning } from "./Learning"
import { TopicLearningFromPersistence } from "../../shared/models"
import { TopicLearningDTO } from "@simulex/models"

interface TopicLearningProps {
  topicLearningId: string
  userId: string
  topic: Topic
  qtyQuestions: number
  qtyQuestionsRecursive: number
  qtyAllQuestionsDepth: number
  maxQtyAllQuestionsDepth: number
  maxQtyAllQuestionsRootRecursive: number
  frequencyInDepth: number
  frequencyInDiscipline: number
  difficultyRecursive: number | null
  collectiveAvgGrade: number | null
  collectiveAvgScore: number | null
  parent: Learning
}

export class TopicLearning extends Entity<TopicLearningProps> {
  private constructor(props: TopicLearningProps) {
    super(props, "topicLearningId")
  }

  static create(dto: CreateTopicLearningInput): TopicLearning {
    if (!dto.topic || !dto.userId || !dto.parent) {
      throw new Error("Missing required properties")
    }

    const topicLearningId = crypto.randomUUID()
    const props: TopicLearningProps = {
      topicLearningId,
      userId: dto.userId,
      topic: dto.topic,
      qtyQuestions: 0,
      qtyQuestionsRecursive: 0,
      qtyAllQuestionsDepth: 0,
      maxQtyAllQuestionsDepth: 0,
      maxQtyAllQuestionsRootRecursive: 0,
      frequencyInDepth: 0,
      frequencyInDiscipline: 0,
      difficultyRecursive: null,
      collectiveAvgGrade: null,
      collectiveAvgScore: 0,
      parent: dto.parent,
    }

    return new TopicLearning(props)
  }

  public static toDomain(dto: TopicLearningFromPersistence): TopicLearning {
    if (!dto.topicLearningId || !dto.topic || !dto.userId || !dto.parent) {
      throw new Error("Missing required properties")
    }
    return new TopicLearning({
      topicLearningId: dto.topicLearningId,
      userId: dto.userId,
      topic: dto.topic,
      qtyQuestions: dto.qtyQuestions ? Number(dto.qtyQuestions) : 0,
      qtyQuestionsRecursive: dto.qtyQuestionsRecursive
        ? Number(dto.qtyQuestionsRecursive)
        : 0,
      qtyAllQuestionsDepth: dto.qtyAllQuestionsDepth
        ? Number(dto.qtyAllQuestionsDepth)
        : 0,
      maxQtyAllQuestionsDepth: dto.maxQtyAllQuestionsDepth
        ? Number(dto.maxQtyAllQuestionsDepth)
        : 0,
      maxQtyAllQuestionsRootRecursive: dto.maxQtyAllQuestionsRootRecursive
        ? Number(dto.maxQtyAllQuestionsRootRecursive)
        : 0,
      frequencyInDepth: dto.frequencyInDepth ? Number(dto.frequencyInDepth) : 0,
      frequencyInDiscipline: dto.frequencyInDiscipline
        ? Number(dto.frequencyInDiscipline)
        : 0,
      difficultyRecursive: dto.difficultyRecursive
        ? Number(dto.difficultyRecursive)
        : 50,
      collectiveAvgGrade: dto.collectiveAvgGrade
        ? Number(dto.collectiveAvgGrade)
        : null,
      collectiveAvgScore: dto.collectiveAvgScore
        ? Number(dto.collectiveAvgScore)
        : null,
      parent: dto.parent,
    })
  }

  get topicLearningId(): string {
    return this.props.topicLearningId
  }

  get topic(): Topic {
    return this.props.topic
  }

  get parent(): Learning {
    return this.props.parent
  }

  get userId(): string {
    return this.props.userId
  }

  // incrementa 1 a cada acerto e decrementa 2 a cada erro, se menor que zero => P = 0.
  public score(): number {
    let score = 0
    this.history.getItems().forEach((item) => {
      if (item.isUserAnswerCorrect) {
        score++
      } else {
        score = score - 2
        score = score < 0 ? 0 : score
      }
    })
    return score
  }

  // Nível de dificuldade do usuário no assunto atual
  // TODO: implementar a fórmula de cálculo do nível
  public levelInTopic(): number {
    return 50
  }

  // TODO: mover para o local de cálculo do aprendizado no assunto atual
  // TODO: implementar a fórmula de cálculo da nota inicial
  // tipo: simples / ponderada
  public initialGradeTopic(topic: Topic, weighted = false): number {
    return weighted ? 0 : 0
  }

  // TODO: implementar a fórmula de cálculo da nota atual
  public actualGradeTopic(topic: Topic, weighted = false): number {
    return weighted ? 0 : 0
  }

  // Aprendizado do usuário no assunto atual
  // TODO: implementar a fórmula de cálculo da nota inicial
  // tipo: simples / ponderada
  public initialGradeDiscipline(discipline: any, weighted = false): number {
    return weighted ? 0 : 0
  }

  // TODO: implementar a fórmula de cálculo da nota atual
  public actualGradeDiscipline(discipline: any, weighted = false): number {
    return weighted ? 0 : 0
  }

  // Aprendizado do usuário no assunto atual
  // 0 a 7 (0: não verificado, 1: em análise, 2: iniciante, 3: leigo, 4: aprendiz, 5: bacharel, 6: mestre, 7: doutor)
  // Média dos aprendizados dos assuntos-filhos do nível logo abaixo, e deve ser convertido para inteiro para localizar o rótulo correspondente
  public learning(): number {
    return this.classifyLearning()
  }

  public learningLabel(): string {
    const labels = [
      "Não verificado",
      "Em análise",
      "Iniciante",
      "Leigo",
      "Aprendiz",
      "Bacharel",
      "Mestre",
      "Doutor",
    ]
    return labels[this.learning()]
  }

  // average of learning recursively
  public learningRecursive(): number {
    const values = []
    if (this.learning() > 1) {
      values.push(this.learning())
    }
    this.props.parent.topics
      .topicsChildrenRecursive(this)
      .forEach((topicLearning: TopicLearning) => {
        if (topicLearning.learning() > 1) {
          values.push(topicLearning.learning())
        }
      })
    return values.length
      ? Math.floor(
          values.reduce((acc, value) => acc + value, 0) / values.length,
        )
      : 0
  }

  public learningRecursiveLabel(): string {
    const labels = [
      "Não verificado",
      "Em análise",
      "Iniciante",
      "Leigo",
      "Aprendiz",
      "Bacharel",
      "Mestre",
      "Doutor",
    ]
    return labels[this.learningRecursive()]
  }

  // Origem do aprendizado do usuário no assunto atual
  // 0 a 2 (0: em análise, 1: pré-existente, 2: Simulex), usando as três primeiras respostas
  // (média dos assuntos-filhos do nível logo abaixo), deve ser apresentado em gráfico de pizza para porcentagens
  public learningSource(): number {
    if (this.history.getCount() > 2) {
      let sum = 0
      for (let i = 0; i < 3; i++) {
        if (this.history.getItems()[i].isUserAnswerCorrect) {
          sum++
        }
      }
      return sum > 1 ? 1 : 2
    }
    if (
      this.history.getCount() === 2 &&
      this.history.getItems()[0].isUserAnswerCorrect &&
      this.history.getItems()[1].isUserAnswerCorrect
    )
      return 1
    return 0
  }

  public learningSourceLabel(): string {
    const labels = ["Em análise", "Pré-existente", "Simulex"]
    return labels[this.learningSource()]
  }

  // Taxa de esquecimento do usuário
  // Anula a contribuição da pontuação no SRS após prazo de revisão, de forma a forçar a revisão do assunto
  public forgettingRate(): number {
    if (
      this.updatedAt() &&
      this.score() > 0 &&
      this.collectiveAvgGrade !== null
    ) {
      const waitingTime = Math.floor(
        Math.pow(1 + (2 * this.collectiveAvgGrade) / 100, this.score() - 1),
      )
      const deadline = this.updatedAt()?.addDays(waitingTime)
      if (deadline && deadline.value <= DateBr.create().value)
        return this.score()
    }
    return 0
  }

  // Qtde de questões do assunto atual
  get qtyQuestions() {
    return this.props.qtyQuestions
  }

  // Qtde de questões dos assuntos filhos recursivamente
  get qtyQuestionsRecursive() {
    return this.props.qtyQuestionsRecursive
  }

  // Qtde de questões do assunto atual + assuntos filhos recursivamente
  get qtyAllQuestionsDepth() {
    return this.props.qtyAllQuestionsDepth
  }

  // Maior qtde de questões de todos os assuntos da mesma profundidade
  get maxQtyAllQuestionsDepth() {
    return this.props.maxQtyAllQuestionsDepth
  }

  // Maior qtde de questões de todos os assuntos root da disciplina recursivamente (para normalização)
  get maxQtyAllQuestionsRootRecursive() {
    return this.props.maxQtyAllQuestionsRootRecursive
  }

  // Frequencia do assunto atual em relação ao total de questões de todos os assuntos da mesma profundidade
  get frequencyInDepth() {
    return this.props.frequencyInDepth
  }

  // Frequencia do assunto atual em relação ao total de questões de todos os assuntos root da disciplina
  // 0 a 1 (assunto root mais frequente = 1)
  get frequencyInDiscipline() {
    return this.props.frequencyInDiscipline
  }

  // Dificuldade do assunto atual
  // 0 a 100 (100 - média de acertos do assunto atual)
  get difficulty() {
    return this.props.collectiveAvgGrade !== null
      ? Number((100 - this.props.collectiveAvgGrade).toFixed(2))
      : 50
  }

  // Dificuldade do assunto atual recursivamente
  // 0 a 100 (100 - média de acertos do assunto atual recursivamente)
  get difficultyRecursive() {
    return this.props.difficultyRecursive !== null
      ? Number(this.props.difficultyRecursive.toFixed(2))
      : 50
  }

  // Média de acertos coletivos do assunto atual
  // 0 a 100
  get collectiveAvgGrade() {
    return this.props.collectiveAvgGrade
      ? Number(this.props.collectiveAvgGrade.toFixed(2))
      : null
  }

  // Média da pontuação coletiva
  get collectiveAvgScore() {
    return this.props.collectiveAvgScore
  }

  // Qtde de questões respondidas
  public qtyQuestionsAnswered() {
    return this.history.getCount()
  }

  // Qtde de questões respondidas corretamente
  public qtyQuestionsCorrectAnswered() {
    return this.history.getItems().filter((item) => item.isUserAnswerCorrect)
      .length
  }

  // Última questão foi respondida corretamente?
  public isLastQuestionCorrectAnswered() {
    return this.history.getCount()
      ? this.history.getShortHistory(1)[0].isUserAnswerCorrect
      : null
  }

  // SRS (Spaced Repetition System)
  // SRS = (frequencyInDepth + collectiveAvgScore )/(2ˆ(Score - forgettingRate))
  // * assuntos com menor SRS devem ser priorizados
  public srs() {
    const collectiveAvgGradeValue = this.collectiveAvgGrade
      ? this.collectiveAvgGrade
      : 100
    return Number(
      (
        (3 - this.frequencyInDepth - collectiveAvgGradeValue / 100) *
        Math.pow(2, this.score())
      ).toFixed(4),
    )
  }

  // Histórico de respostas do usuário no assunto
  get history(): QuizAnswerList {
    return this.props.parent.history.filterByTopic(this.topic.topicId)
  }

  public updatedAt(): DateBr | null {
    return this.history.getShortHistory(1).length
      ? this.history.getShortHistory(1)[0].createdAt
      : null
  }

  // Média da nota do usuário
  public avgGrade() {
    return this.qtyQuestionsAnswered()
      ? Number(
          (
            (100 * this.qtyQuestionsCorrectAnswered()) /
            this.qtyQuestionsAnswered()
          ).toFixed(2),
        )
      : null
  }

  public setDifficultyRecursive(difficultyRecursive: number): void {
    this.props.difficultyRecursive = difficultyRecursive
  }

  public setCollectiveAvgGrade(collectiveAvgGrade: number): void {
    this.props.collectiveAvgGrade = collectiveAvgGrade
  }

  public setCollectiveAvgScore(collectiveAvgScore: number): void {
    this.props.collectiveAvgScore = collectiveAvgScore
  }

  public setFrequencyInDepth(frequency: number): void {
    this.props.frequencyInDepth = frequency
  }

  public setFrequencyInDiscipline(frequency: number): void {
    this.props.frequencyInDiscipline = frequency
  }

  public setQtyQuestions(qtyQuestions: number): void {
    this.props.qtyQuestions = qtyQuestions
  }

  public setQtyQuestionsRecursive(qtyQuestionsRecursive: number): void {
    this.props.qtyQuestionsRecursive = qtyQuestionsRecursive
  }

  public setQtyAllQuestionsDepth(qtyAllQuestionsDepth: number): void {
    this.props.qtyAllQuestionsDepth = qtyAllQuestionsDepth
  }

  public setMaxQtyAllQuestionsDepth(maxQtyAllQuestionsDepth: number): void {
    this.props.maxQtyAllQuestionsDepth = maxQtyAllQuestionsDepth
  }

  public setMaxQtyAllQuestionsRootRecursive(
    maxQtyAllQuestionsRootRecursive: number,
  ): void {
    this.props.maxQtyAllQuestionsRootRecursive = maxQtyAllQuestionsRootRecursive
  }

  public toDTO(): TopicLearningDTO {
    return {
      topicLearningId: this.props.topicLearningId,
      userId: this.props.userId,
      topic: this.props.topic.toDTO(),
      score: this.score(),
      levelInTopic: this.levelInTopic(),
      learning: this.learning(),
      learningLabel: this.learningLabel(),
      learningSource: this.learningSource(),
      learningSourceLabel: this.learningSourceLabel(),
      qtyQuestions: this.qtyQuestions,
      qtyQuestionsRecursive: this.qtyQuestionsRecursive,
      qtyAllQuestionsDepth: this.qtyAllQuestionsDepth,
      maxQtyAllQuestionsDepth: this.maxQtyAllQuestionsDepth,
      maxQtyAllQuestionsRootRecursive: this.maxQtyAllQuestionsRootRecursive,
      frequencyInDepth: this.frequencyInDepth,
      frequencyInDiscipline: this.frequencyInDiscipline,
      difficultyRecursive: this.difficultyRecursive,
      collectiveAvgGrade: this.collectiveAvgGrade,
      collectiveAvgScore: this.collectiveAvgScore,
      qtyQuestionsAnswered: this.qtyQuestionsAnswered(),
      qtyQuestionsCorrectAnswered: this.qtyQuestionsCorrectAnswered(),
      isLastQuestionCorrectAnswered: this.isLastQuestionCorrectAnswered(),
      avgGrade: this.avgGrade(),
      srs: this.srs(),
      history: this.history.getItems().map((item) => item.toDTO()),
    }
  }

  private classifyLearning(): number {
    // calcula a soma ponderada das últimas 5 questões do assunto
    function weightedSum(list: QuizAnswer[]): number {
      let counter = 0
      let sum = 0
      let maxWeightedSum = 0
      list.forEach((quizAnswer: QuizAnswer) => {
        counter++
        if (quizAnswer.isUserAnswerCorrect) {
          sum += counter
        }
        maxWeightedSum += counter
      })
      return Math.floor((sum * 1000) / maxWeightedSum) / 10
    }

    // calcula a média das últimas 5 questões do assunto
    function avgCorrectAnswered(list: QuizAnswer[]): number | null {
      if (!list.length) return null
      const correctAnswered = list.filter(
        (quizAnswer: QuizAnswer) => quizAnswer.isUserAnswerCorrect,
      ).length
      return Math.floor((correctAnswered * 1000) / list.length) / 10
    }

    // verifica se o ponto está dentro da elipse
    // maiorweightedSum => eixo X da elipse
    // maioravgCorrectAnswered => eixo Y da elipse
    function insideEllipse(
      weightedSum: number,
      avgCorrectAnswered: number | null,
      maxWeightedSum: number,
      maxAvgCorrectAnswered: number,
    ): boolean | null {
      if (avgCorrectAnswered === null) return null
      const result =
        avgCorrectAnswered ** 2 / maxAvgCorrectAnswered ** 2 +
        weightedSum ** 2 / maxWeightedSum ** 2
      return result <= 1
    }

    const shortHistory: QuizAnswer[] = this.history.getShortHistory(5)
    // 0: não verificado (não respondeu nenhuma questão) ou 1: em análise (respondeu apenas uma questão)
    let learning = this.history.getCount() ? 1 : 0

    if (this.history.getItems().length > 1) {
      // 6: mestre
      learning = 6
      // 5: bacharel
      if (
        insideEllipse(
          weightedSum(shortHistory),
          avgCorrectAnswered(shortHistory),
          115,
          121,
        )
      ) {
        learning = 5
      }
      // 4: aprendiz
      if (
        insideEllipse(
          weightedSum(shortHistory),
          avgCorrectAnswered(shortHistory),
          93,
          99,
        )
      ) {
        learning = 4
      }
      // 3: leigo
      if (
        insideEllipse(
          weightedSum(shortHistory),
          avgCorrectAnswered(shortHistory),
          57,
          70,
        )
      ) {
        learning = 3
      }
      // 2: ignorante
      if (
        insideEllipse(
          weightedSum(shortHistory),
          avgCorrectAnswered(shortHistory),
          11,
          25,
        )
      ) {
        learning = 2
      }
      if (shortHistory.length === 2) {
        if (weightedSum(shortHistory) === 100) {
          learning = 5 // bacharel
        }
        if (
          weightedSum(shortHistory) === 66.6 &&
          avgCorrectAnswered(shortHistory) === 50
        ) {
          learning = 4 // aprendiz
        }
      }
      if (shortHistory.length === 3) {
        if (
          weightedSum(shortHistory) === 83.3 &&
          avgCorrectAnswered(shortHistory) === 66.6
        ) {
          learning = 4 // aprendiz
        }
        if (weightedSum(shortHistory) === 100) {
          learning = 6 // mestre
        }
      }
      if (shortHistory.length === 4) {
        if (
          weightedSum(shortHistory) === 60 &&
          avgCorrectAnswered(shortHistory) === 75
        ) {
          learning = 5 // bacharel
        }
        if (weightedSum(shortHistory) === 100) {
          learning = 6 // mestre
        }
        // console.log("length", shortHistory.length)
        // console.log("learning", learning)
        // console.log("weightedSum", weightedSum(shortHistory))
        // console.log("avgCorrectAnswered", avgCorrectAnswered(shortHistory))
      }
      if (shortHistory.length === 5) {
        if (weightedSum(shortHistory) === 100) {
          learning = 7 // doutor
        }
      }
    }
    return learning
  }
}

//   As frequências são o percentual do total de questões recursivamente do assunto atual em relação
//   ao total de questões recursivamente de todos os assuntos da disciplina
// - QARec = qtde perguntas do assunto atual + perguntas assuntos recursivamente (todos assuntos-filhos),
// - SomaQARec = Maior Soma de QARec de todos os assuntos root da disciplina (para normalização),
// - Profundidade = Qtde assuntos-pais + 1 (próprio nível)
// - F = (QARec / SomaQARec)  // assunto root mais frequente = 1

//   qtyAllQuestionsTopicRoot => qtyQuestions + qtyQuestionsRecursive
//   Profundidade => depth
//   A frequencia é calculada por profundidade (recursivamente)  // assunto mais frequente na profundidade = 1
//   frequencyDepth = (qtyQuestions + qtyQuestionsRecursive) / Max(qtyQuestions + qtyQuestionsRecursive)

//  Considerar a frequencia do assunto root na prioridade das questões (mais questões para assuntos mais frequentes)
//  De forma a aproveitar que as questões já estão classificadas por assunto root
//  Selecionado o próximo assunto, selecionar o micro-assunto com base na frequencia dentro daquela profundidade
//  de modo a sequenciar as questões seguindo a profundidade dos assuntos (mais geral para mais específico)
//  o aprendizado deve ser nivelado do geral para o específico
//  todas as questões serão movidas para o assunto "A classificar" de forma a não impactarem na frequencia dos assuntos e o assunto "A classificar" será mostrado nos gráficos como sendo o assunto root
// caso haja o assunto "Conceito", o mesmo será mostrado nos gráficos como sendo o assunto pai

export type CreateTopicLearningInput = {
  topic: Topic
  userId: string
  parent: Learning
}
