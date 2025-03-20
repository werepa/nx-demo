import { OptionState } from "../../shared/models"
import { QuestionOption } from "./QuestionOption"

describe("Entity => QuestionOption", () => {
  let questionOption: QuestionOption

  beforeEach(() => {
    const dto = {
      text: "Paris",
      key: true,
      questionId: "question-123",
    }
    questionOption = QuestionOption.create(dto)
  })

  it("should create an question option with the correct parameters", () => {
    expect(questionOption).toBeInstanceOf(QuestionOption)
    expect(questionOption.optionId).toHaveLength(36)
    expect(questionOption.text).toBe("Paris")
    expect(questionOption.key).toBe(true)
    expect(questionOption.item).toBe(1)
    expect(questionOption.questionId).toBe("question-123")
  })

  it("should update the text of the question option", () => {
    questionOption.updateText("London")
    expect(questionOption.text).toBe("London")
  })

  it("should update the key of the question option", () => {
    questionOption.updateKey(false)
    expect(questionOption.key).toBe(false)
  })

  it("should update the item of the question option", () => {
    questionOption.updateItem(1)
    expect(questionOption.item).toBe(1)
  })

  it("should update the questionId of the question option", () => {
    questionOption.updateQuestionId("question-456")
    expect(questionOption.questionId).toBe("question-456")
  })

  it("should convert Option to DTO format correctly", () => {
    const dto = questionOption.toDTO()

    expect(dto.optionId).toHaveLength(36)
    expect(dto.text).toBe("Paris")
    expect(dto.isCorrectAnswer).toBe(true)
    expect(dto.item).toBe(1)
    expect(dto.questionId).toBe("question-123")
  })

  it("should convert persistence format to Option Domain correctly", () => {
    const persistence: OptionState = {
      optionId: "option-123",
      text: "Paris",
      key: true,
      item: 1,
      obs: null,
      questionId: "question-123",
    }
    const DomainOption = QuestionOption.toDomain(persistence)

    expect(DomainOption).toBeInstanceOf(QuestionOption)
    expect(DomainOption.optionId).toBe("option-123")
    expect(DomainOption.text).toBe("Paris")
    expect(DomainOption.key).toBe(true)
    expect(DomainOption.item).toBe(1)
    expect(DomainOption.questionId).toBe("question-123")
  })

  it("should throw an error when creating an option without required fields", () => {
    const createOptionWithoutText = () => {
      QuestionOption.create({ text: "", key: true, questionId: "question-123" })
    }
    expect(createOptionWithoutText).toThrow("Text of option is required")
  })

  it("should throw an error when converting persistence format to QuestionOption Domain with missing properties", () => {
    const convertPersistenceWithMissingProperties = () => {
      // @ts-expect-error missing properties
      QuestionOption.toDomain({
        optionId: "option-123",
        text: "Paris",
        item: 1,
        key: true,
      })
    }
    expect(convertPersistenceWithMissingProperties).toThrow("Missing required properties")
  })
})
