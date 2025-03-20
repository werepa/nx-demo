import { TopicDTO, TopicFromPersistence } from "./TopicDTO"

export type CreateDisciplineDTO = {
  name: string
}

export type DisciplineDTO = {
  disciplineId: string
  name: string
  topics: TopicDTO[]
  image: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type DisciplineFromPersistence = {
  disciplineId: string
  name: string
  topics: TopicFromPersistence[]
  image: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date | null
}

export type DisciplineUpdateDTO = {
  name?: string
  isActive?: boolean
}
