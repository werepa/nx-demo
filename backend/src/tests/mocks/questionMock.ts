import { faker } from "@faker-js/faker"
import { Question, QuestionOption } from "../../domain/entity"
import { QuestionOptionDTO, QuestionDTO } from "@simulex/models"

interface IQuestionMockDto {
  questionId?: string
  topicId?: string
}

interface QuestionMockOptions {
  topicId?: string
  topicRootId?: string
  prompt?: string
  isActive?: boolean
  isCorrectAnswer?: boolean
  optionText?: string
  isMultipleChoice?: boolean
}

export const questionMockPersistence = (dto: IQuestionMockDto = {}): QuestionDTO => {
  const questionId = dto.questionId || faker.string.uuid()
  const topicId = dto.topicId || faker.string.uuid()
  const createdAt = faker.date.recent()
  const qtyAnswered = Math.floor(Math.random() * 100)
  const questionDTO: QuestionDTO = {
    questionId: questionId,
    topicId: topicId,
    prompt: "Question " + questionId,
    options: [],
    isMultipleChoice: Math.random() > 0.5,
    difficulty: Math.floor(Math.random() * 5 + 1),
    qtyAnswered: qtyAnswered,
    qtyCorrectAnswers: Math.floor(Math.random() * qtyAnswered),
    difficultyRecursive: Math.floor(Math.random() * 5 + 1),
    simulexHash: faker.string.uuid(),
    topicRootId: topicId,
    linkedTopics: [],
    year: faker.date.past().getFullYear().toString(),
    sourceId: faker.string.uuid(),
    isActive: true,
    createdBy: faker.string.uuid(),
    createdAt: createdAt,
  }
  return questionDTO
}

export const questionMock = (dto: IQuestionMockDto = {}): Question => {
  const questionDTO = questionMockPersistence(dto)
  return Question.toDomain(questionDTO)
}

export const questionFromPersistence = (question: Question): QuestionDTO => {
  return {
    questionId: question.id,
    topicId: question.topicId,
    prompt: question.prompt,
    options: question.options.getItems().map((option) => ({
      optionId: option.optionId,
      text: option.text,
      isCorrectAnswer: option.key,
      item: option.item || 0,
      obs: option.obs || "",
      questionId: option.questionId,
    })),
    isMultipleChoice: question.isMultipleChoice,
    difficulty: question.difficulty,
    qtyAnswered: question.qtyAnswered,
    qtyCorrectAnswers: question.qtyCorrectAnswers,
    difficultyRecursive: question.difficultyRecursive,
    simulexHash: question.simulexHash,
    topicRootId: question.topicRootId,
    linkedTopics: question.linkedTopics,
    year: question.year,
    sourceId: question.sourceId,
    isActive: question.isActive,
    createdBy: question.createdBy,
    createdAt: question.createdAt.value,
  }
}

export const getQuestionMock = (options: QuestionMockOptions = {}): Question => {
  const {
    topicId = "1",
    topicRootId = "1",
    prompt = "Sample question",
    isCorrectAnswer = true,
    optionText = "Sample option",
  } = options

  const questionOption = QuestionOption.create({
    text: optionText,
    questionId: "1",
    key: isCorrectAnswer,
  })

  return Question.create({
    topicId,
    topicRootId,
    prompt,
    options: [questionOption],
  })
}

export const getCorrectOption = (question: Question): string => {
  const correctOption = question.options.getItems().find((option) => option.key)
  return correctOption?.optionId || ""
}

export const getIncorrectOption = (question: Question): string => {
  const incorrectOption = question.options.getItems().find((option) => !option.key)
  return incorrectOption?.optionId || ""
}

export const isCorrectAnswer = (question: Question | QuestionDTO, option: QuestionOptionDTO): boolean => {
  if (question.isMultipleChoice) {
    return option?.isCorrectAnswer ?? false
  } else {
    const options = "getItems" in question.options ? question.options.getItems() : question.options

    const firstOption = options[0] as QuestionOptionDTO
    const optionId = option.optionId || option.optionId

    if (!optionId && !firstOption.isCorrectAnswer) {
      return true
    } else if (optionId === (firstOption.optionId || firstOption.optionId) && firstOption.isCorrectAnswer) {
      return true
    }
    return false
  }
}
