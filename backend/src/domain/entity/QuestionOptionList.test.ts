import { QuestionOption } from "./QuestionOption"
import { QuestionOptionList } from "./QuestionOptionList"

describe("Entity => QuestionOptionList", () => {
  let questionId: string
  let questionOptionList: QuestionOptionList

  beforeEach(() => {
    questionId = "anyQuestionId"
    questionOptionList = QuestionOptionList.create(questionId, [
      QuestionOption.create({ questionId, text: "Option 1", key: true }),
      QuestionOption.create({ questionId, text: "Option 2", key: false }),
      QuestionOption.create({ questionId, text: "Option 3", key: false }),
      QuestionOption.create({ questionId, text: "Option 4", key: false }),
      QuestionOption.create({
        questionId,
        text: "Nenhuma das anteriores",
        key: false,
      }),
    ])
  })

  it("should create an QuestionOptionList with the correct parameters", () => {
    expect(questionOptionList).toBeInstanceOf(QuestionOptionList)
    expect(questionOptionList.getItems()).toHaveLength(5)
    expect(questionOptionList.getItems()[0]).toBeInstanceOf(QuestionOption)
    expect(questionOptionList.getItems()[0].text).toBe("Option 1")
    expect(questionOptionList.getItems()[0].item).toBe(0)
    expect(questionOptionList.getItems()[1].text).toBe("Option 2")
    expect(questionOptionList.getItems()[1].item).toBe(1)
    expect(questionOptionList.getItems()[2].text).toBe("Option 3")
    expect(questionOptionList.getItems()[2].item).toBe(2)
    expect(questionOptionList.getItems()[3].text).toBe("Option 4")
    expect(questionOptionList.getItems()[3].item).toBe(3)
    expect(questionOptionList.getItems()[4].text).toBe("Nenhuma das anteriores")
    expect(questionOptionList.getItems()[4].item).toBe(4)
  })

  it("should add an QuestionOption to the QuestionOptionList", () => {
    const newQuestionOption = QuestionOption.create({
      questionId,
      text: "New Option",
      key: false,
    })
    questionOptionList.add(newQuestionOption)
    expect(questionOptionList.getItems()).toHaveLength(6)
    expect(questionOptionList.getItems()[5]).toBe(newQuestionOption)
  })

  it("should return the QuestionOptionList items in the original order", () => {
    const sortedItems = questionOptionList.getItems()
    expect(sortedItems[0].text).toBe("Option 1")
    expect(sortedItems[1].text).toBe("Option 2")
    expect(sortedItems[2].text).toBe("Option 3")
    expect(sortedItems[3].text).toBe("Option 4")
    expect(sortedItems[4].text).toBe("Nenhuma das anteriores")
  })

  it("should remove an QuestionOption from the QuestionOptionList", () => {
    const optionToRemove = questionOptionList.getItems()[2]
    questionOptionList.remove(optionToRemove)
    expect(questionOptionList.getItems()).toHaveLength(4)
    expect(questionOptionList.getItems()[0].text).toBe("Option 1")
    expect(questionOptionList.getItems()[0].item).toBe(1)
    expect(questionOptionList.getItems()[1].text).toBe("Option 2")
    expect(questionOptionList.getItems()[1].item).toBe(2)
    expect(questionOptionList.getItems()[2].text).toBe("Option 4")
    expect(questionOptionList.getItems()[2].item).toBe(3)
    expect(questionOptionList.getItems()[3].text).toBe("Nenhuma das anteriores")
    expect(questionOptionList.getItems()[3].item).toBe(4)
  })

  it("should return the QuestionOptionList items in random order with special options at the end", () => {
    const randomItems1 = questionOptionList.getRandomItems()
    const randomItems2 = questionOptionList.getRandomItems()
    const randomItems3 = questionOptionList.getRandomItems()
    const isRandom =
      randomItems1 !== randomItems2 ||
      randomItems1 !== randomItems3 ||
      randomItems2 !== randomItems3
    expect(isRandom).toBeTruthy()
    expect(randomItems1[4].text).toMatch(
      /(Nenhuma das anteriores|Todas as anteriores|Todas as alternativas estão corretas)/,
    )
    expect(randomItems2[4].text).toMatch(
      /(Nenhuma das anteriores|Todas as anteriores|Todas as alternativas estão corretas)/,
    )
    expect(randomItems3[4].text).toMatch(
      /(Nenhuma das anteriores|Todas as anteriores|Todas as alternativas estão corretas)/,
    )
  })
})
