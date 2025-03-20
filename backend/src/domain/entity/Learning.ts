import { Entity } from "../../shared/domain/entity"
import { Topic } from "./Topic"
import { QuizAnswerList } from "./QuizAnswerList"
import { QuizAnswer } from "./QuizAnswer"
import { Discipline } from "./Discipline"
import { TopicLearningList } from "./TopicLearningList"
import { LearningState } from "../../shared/models"
import { User } from "./User"
import { TopicLearning } from "./TopicLearning"
import { LearningDTO } from "@simulex/models"
import { randomUUID } from "crypto"

interface LearningProps {
  learningId: string
  user: User
  discipline: Discipline
  topics: TopicLearningList
  history: QuizAnswerList
}

export class Learning extends Entity<LearningProps> {
  private constructor(props: LearningProps) {
    super(props, "learningId")
  }

  static create(dto: CreateLearningCommand): Learning {
    if (!dto.user || !dto.discipline) {
      throw new Error("Missing required properties")
    }
    const learningId = randomUUID()
    const props: LearningProps = {
      learningId,
      user: dto.user,
      discipline: dto.discipline,
      topics: TopicLearningList.create(dto.user.userId, []),
      history: QuizAnswerList.create(null, []),
    }
    const learning = new Learning(props)
    dto.discipline.topics
      .getItems()
      .filter((topic: Topic) => topic.isActive)
      .forEach((topic: Topic) => {
        props.topics.add(
          TopicLearning.create({
            topic,
            userId: dto.user.userId,
            parent: learning,
          })
        )
      })
    return learning
  }

  public static toDomain(dto: LearningState): Learning {
    if (!dto.user || !dto.discipline || !dto.topics || !dto.history) {
      throw new Error("Missing required properties")
    }
    const learningId = randomUUID()
    return new Learning({
      learningId,
      user: User.toDomain(dto.user),
      discipline: Discipline.toDomain(dto.discipline),
      topics: TopicLearningList.create(
        dto.user.userId,
        dto.topics.map((t) => TopicLearning.toDomain(t))
      ),
      history: QuizAnswerList.create(
        null,
        dto.history.map((answer) => QuizAnswer.toDomain(answer))
      ),
    })
  }

  get learningId(): string {
    return this.props.learningId
  }

  get user(): User {
    return this.props.user
  }

  get discipline(): Discipline {
    return this.props.discipline
  }

  get topics(): TopicLearningList {
    return this.props.topics
  }

  get history(): QuizAnswerList {
    return this.props.history
  }

  public topic(topicId: string): TopicLearning | null {
    return this.props.topics.findByTopicId(topicId)
  }

  public toDTO(): LearningDTO {
    return {
      learningId: this.props.learningId,
      user: this.props.user.toDTO(),
      discipline: this.props.discipline.toDTO(),
      topics: this.props.topics.getItems().map((topicLearning: TopicLearning) => topicLearning.toDTO()),
      history: this.props.history.getItems().map((item: QuizAnswer) => item.toDTO()),
    }
  }
}

export type CreateLearningCommand = {
  user: User
  discipline: Discipline
}
