export type CreateTopicDTO = {
  name: string
}

export type TopicDTO = {
  topicId: string
  disciplineId: string
  name: string
  isTopicClassify: boolean
  topicParentId: string
  topicRootId: string
  depth: number
  dependencies: string[]
  obs: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export type TopicUpdateDTO = {
  name?: string
  isActive?: boolean
  obs?: string
}
