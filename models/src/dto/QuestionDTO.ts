export type QuestionDTO = {
  questionId: string
  topicId: string
  prompt: string
  isMultipleChoice: boolean
  options: QuestionOptionDTO[]
  difficulty: number
  qtyAnswered: number
  qtyCorrectAnswers: number
  difficultyRecursive: number
  simulexHash: string
  topicRootId: string
  linkedTopics: string[]
  year: string
  sourceId: string
  isActive: boolean
  createdBy: string
  createdAt: Date
}

export type QuestionOptionDTO = {
  optionId: string
  text: string
  isCorrectAnswer: boolean
  item: number
  obs: string
  questionId: string
}

// multiple choice question has multiple options
// not multiple choice question has only one option true or false
export type QuestionUpdateDTO = {
  prompt?: string
  isMultipleChoice?: boolean
  difficulty?: number
  isActive?: boolean
}

export type QuestionOptionUpdateDTO = {
  text?: string
  key?: boolean
  item?: number
  obs?: string
}
