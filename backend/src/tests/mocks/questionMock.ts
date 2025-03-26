import { faker } from "@faker-js/faker"
import { Question, QuestionOption } from "../../domain/entity"
import { QuestionOptionDTO, QuestionDTO } from "@simulex/models"
import { QuestionState } from "../../shared/models"
import { DateBr } from "backend/src/shared/domain/valueObject"

interface IQuestionMockDto {
  questionId?: string
  topicId?: string
}

interface QuestionMockCommand {
  questionId?: string
  topicId?: string
  topicRootId?: string
  prompt?: string
  isActive?: boolean
  isCorrectAnswer?: boolean
  optionText?: string
  isMultipleChoice?: boolean
}

export const questionMockState = (dto: IQuestionMockDto = {}): QuestionState => {
  const questionId = dto.questionId || faker.string.uuid()
  const topicId = dto.topicId || faker.string.uuid()
  const createdAt = faker.date.recent()
  const qtyAnswered = Math.floor(Math.random() * 100)
  const questionState: QuestionState = {
    questionId: questionId,
    topicId: topicId,
    prompt: "Question " + questionId,
    options: [
      QuestionOption.create({
        questionId: questionId,
        text: "Sample option 1",
        isCorrectAnswer: Math.random() > 0.5,
      }),
    ],
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
  return questionState
}

export const questionMock = (dto: QuestionMockCommand = {}): Question => {
  const {
    questionId = faker.string.uuid(),
    topicId = faker.string.uuid(),
    topicRootId = faker.string.uuid(),
    prompt = "Sample question",
    isCorrectAnswer = true,
    optionText = "Sample option",
  } = dto

  const questionOption = QuestionOption.create({
    text: optionText,
    questionId,
    isCorrectAnswer: isCorrectAnswer,
  })

  return Question.toDomain({
    questionId,
    topicId,
    topicRootId,
    prompt,
    options: [questionOption],
    isMultipleChoice: false,
  })
}

export const questionState = (question: Question): QuestionState => {
  if (!question) {
    throw new Error("Question is required")
  }
  return {
    questionId: question.id,
    topicId: question.topicId,
    prompt: question.prompt || "Julgue o item a seguir:",
    options: question.options.getItems().map((option) => option),
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

export const getCorrectOption = (question: Question): string => {
  if (!question) {
    throw new Error("Question is required")
  }
  if (!question.options) {
    throw new Error("Questions must have at least one option")
  }
  const correctOption = question.options.getItems().find((option) => option.isCorrectAnswer)
  return correctOption?.optionId || null
}

export const getIncorrectOption = (question: Question): string => {
  const incorrectOption = question.options.getItems().find((option) => !option.isCorrectAnswer)
  return incorrectOption?.optionId || null
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
