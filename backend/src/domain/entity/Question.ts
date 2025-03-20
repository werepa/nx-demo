import { DateBr } from "../../shared/domain/valueObject"
import { QuestionOption, QuestionOptionList } from "."
import { Entity } from "../../shared/domain/entity"
import { Md5 } from "ts-md5"
import { QuestionDTO } from "@simulex/models"
import { QuestionFromPersistence } from "../../shared/models"

interface QuestionProps {
  questionId: string
  topicId: string
  prompt: string
  options: QuestionOptionList
  isMultipleChoice: boolean
  difficulty: number
  qtyCorrectAnswered: number
  qtyAnswered: number
  difficultyRecursive: number
  simulexHash: string
  topicRootId: string
  linkedTopics: string[]
  year: string
  sourceId: string
  isActive: boolean
  createdBy: string
  createdAt: DateBr
}

export class Question extends Entity<QuestionProps> {
  private constructor(props: QuestionProps) {
    super(props, "questionId")
    if (!props.simulexHash.length) {
      this.calculateSimulexHash()
    }
  }

  static create(dto: CreateQuestionInput): Question {
    if (!dto.prompt) {
      dto.prompt = dto.options.length > 1 ? "Julgue os itens abaixo:" : "Julgue o item abaixo:"
    }

    if (!dto.options || dto.options.length === 0) {
      throw new Error("Questions must be at least one option")
    }

    if (!dto.topicId || !dto.topicRootId) {
      throw new Error("TopicId and TopicRootId is required")
    }

    const questionId = crypto.randomUUID()
    const options: QuestionOption[] = []
    dto.options.forEach((option) => {
      options.push(
        QuestionOption.create({
          questionId,
          text: option.text,
          key: option.key,
        })
      )
    })

    const isMultipleChoice = dto.options.length > 1
    if (isMultipleChoice && dto.options.filter((option) => option.key).length === 0) {
      throw new Error("Questions of type multiple choice must be at least one correct key")
    }

    if (isMultipleChoice && dto.options.filter((option) => option.key).length > 1) {
      throw new Error("Questions of type multiple choice must be only one correct key")
    }

    const currentYear = new Date().getFullYear().toString()
    const props: QuestionProps = {
      questionId,
      topicId: dto.topicId,
      prompt: dto.prompt,
      options: QuestionOptionList.create(questionId, options),
      isMultipleChoice,
      difficulty: 0.5,
      qtyCorrectAnswered: 0,
      qtyAnswered: 0,
      difficultyRecursive: 0.5,
      simulexHash: "",
      topicRootId: dto.topicRootId,
      linkedTopics: [],
      year: dto.year ?? currentYear,
      sourceId: dto.sourceId ?? null,
      isActive: true,
      createdBy: dto.createdBy ?? null,
      createdAt: DateBr.create(),
    }
    return new Question(props)
  }

  static toDomain(dto: QuestionFromPersistence): Question {
    if (!dto.questionId || !dto.topicId || !dto.topicRootId || !dto.options) {
      throw new Error("Missing required properties")
    }

    const props: QuestionProps = {
      questionId: dto.questionId,
      topicId: dto.topicId,
      prompt: dto.prompt,
      options: QuestionOptionList.create(
        dto.questionId,
        JSON.parse(dto.options).map((option: QuestionOption) => QuestionOption.toDomain(option))
      ),
      isMultipleChoice: !!dto.isMultipleChoice,
      difficulty: parseFloat(dto.difficulty),
      qtyCorrectAnswered: dto.qtyCorrectAnswers,
      qtyAnswered: dto.qtyAnswered,
      difficultyRecursive: parseFloat(dto.difficultyRecursive),
      simulexHash: dto.simulexHash,
      topicRootId: dto.topicRootId,
      linkedTopics: JSON.parse(dto.linkedTopics),
      year: dto.year,
      sourceId: dto.sourceId ?? null,
      isActive: !!dto.isActive,
      createdBy: dto.createdBy ?? null,
      createdAt: DateBr.create(dto.createdAt),
    }
    return new Question(props)
  }

  get questionId() {
    return this.props.questionId
  }

  get topicId() {
    return this.props.topicId
  }

  get prompt() {
    return this.props.prompt
  }

  get isMultipleChoice() {
    return this.props.isMultipleChoice
  }

  get options() {
    return this.props.options
  }

  get difficulty() {
    return this.props.difficulty
  }

  get difficultyRecursive() {
    return this.props.difficultyRecursive
  }

  get qtyCorrectAnswers() {
    return this.props.qtyCorrectAnswered
  }

  get qtyAnswered() {
    return this.props.qtyAnswered
  }

  // hash personalizado para comparar se a question é muito semelhante a outra question
  get simulexHash() {
    return this.props.simulexHash
  }

  get topicRootId() {
    return this.props.topicRootId
  }

  get linkedTopics() {
    return this.props.linkedTopics
  }

  get year() {
    return this.props.year
  }

  get sourceId() {
    return this.props.sourceId
  }

  get isActive() {
    return this.props.isActive
  }

  get createdBy() {
    return this.props.createdBy
  }

  get createdAt() {
    return this.props.createdAt
  }

  getCorrectOption(): QuestionOption {
    return this.props.options.getItems().find((option) => option.key)
  }

  updatePrompt(prompt: string): void {
    this.props.prompt = prompt
  }

  updateMultipleChoice(isMultipleChoice: boolean): void {
    this.props.isMultipleChoice = isMultipleChoice
  }

  updateDifficulty(difficulty: number): void {
    this.props.difficulty = difficulty
  }

  updateQtyCorrectAnswers(qtyCorrectAnswers: number): void {
    this.props.qtyCorrectAnswered = qtyCorrectAnswers
  }

  updateQtyAnswered(qtyAnswered: number): void {
    this.props.qtyAnswered = qtyAnswered
  }

  updateTopicRootId(topicRootId: string): void {
    this.props.topicRootId = topicRootId
  }

  // should add a topic to the linkedTopics array if not already exists
  linkTopic(newTopicId: string): void {
    if (!this.props.linkedTopics.includes(newTopicId)) {
      this.props.linkedTopics.push(newTopicId)
    }
  }

  // should remove a topic from the linkedTopics array if exists
  unlinkTopic(removedTopicId: string): void {
    this.props.linkedTopics = this.props.linkedTopics.filter((topicId: string) => topicId !== removedTopicId)
  }

  updateYear(year: string): void {
    this.props.year = year
  }

  updatesourceId(sourceId: string): void {
    this.props.sourceId = sourceId
  }

  deactivate(): void {
    this.props.isActive = false
  }

  activate(): void {
    this.props.isActive = true
  }

  calculateSimulexHash(): void {
    const calculaHash = (text: string) => {
      let txt = text.replace(/\b.{1,3}\b/g, "")
      txt = txt.replace(/\W/g, "")
      return Md5.hashStr(txt)
    }
    const lista = []
    lista.push(calculaHash(this.prompt))
    this.options.getItems().map((alt: QuestionOption) => lista.push(calculaHash(alt.text)))
    lista.sort()
    this.props.simulexHash = Md5.hashStr(lista.join(""))
  }

  toDTO(): QuestionDTO {
    return {
      questionId: this.props.questionId,
      topicId: this.props.topicId,
      prompt: this.props.prompt,
      options: this.props.options.getItems().map((option: QuestionOption) => option.toDTO()),
      isMultipleChoice: this.props.isMultipleChoice,
      difficulty: this.props.difficulty,
      qtyAnswered: this.props.qtyAnswered,
      qtyCorrectAnswers: this.props.qtyCorrectAnswered,
      difficultyRecursive: this.props.difficultyRecursive,
      simulexHash: this.props.simulexHash,
      topicRootId: this.props.topicRootId,
      linkedTopics: this.props.linkedTopics,
      year: this.props.year,
      sourceId: this.props.sourceId,
      isActive: this.props.isActive,
      createdBy: this.props.createdBy,
      createdAt: this.props.createdAt.value,
    }
  }
}

export type CreateQuestionInput = {
  topicId: string
  topicRootId: string
  prompt?: string
  options: { text: string; key?: boolean }[]
  year?: string
  sourceId?: string
  createdBy?: string
}
