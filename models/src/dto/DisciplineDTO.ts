import { TopicDTO } from "./TopicDTO"

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

export type DisciplineUpdateDTO = {
  name?: string
  isActive?: boolean
}
