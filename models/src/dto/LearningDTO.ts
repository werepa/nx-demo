import { DisciplineDTO } from "./DisciplineDTO"
import { QuizAnswerDTO } from "./QuizDTO"
import { TopicLearningDTO } from "./TopicLearningDTO"
import { UserDTO } from "./UserDTO"

export type LearningDTO = {
  learningId: string
  user: UserDTO
  discipline: DisciplineDTO
  topics: TopicLearningDTO[]
  history: QuizAnswerDTO[]
}
