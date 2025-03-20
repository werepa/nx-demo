import { Entity } from "../../shared/domain/entity"
import { DateBr } from "../../shared/domain/valueObject"
import { QuizTopicList } from "./QuizTopicList"
import { Discipline } from "./Discipline"
import { QuizType } from "../valueObject"
import { User } from "./User"
import { QuizTypeEnum, RoleEnum } from "../../shared/enum"
import { QuizAnswerList } from "./QuizAnswerList"
import { Topic } from "./Topic"
import { QuizDTO } from "@simulex/models"
import { QuizState } from "../../shared/models"
import { randomUUID } from "crypto"

export interface QuizProps {
  quizId: string
  quizType: QuizType
  user: User
  discipline: Discipline
  topicsRoot: QuizTopicList
  answers: QuizAnswerList
  isActive: boolean
  createdAt: DateBr
  updatedAt: DateBr | null
}

export class Quiz extends Entity<QuizProps> {
  private constructor(props: QuizProps) {
    super(props, "quizId")
  }

  static create(dto: CreateQuizCommand): Quiz {
    if (!dto.user || !dto.discipline) {
      throw new Error("Missing required properties")
    }
    if (!dto.quizType) dto.quizType = QuizType.create("aleatorio")
    if (
      (dto.quizType.value === QuizTypeEnum.LEARNING || dto.quizType.value === QuizTypeEnum.CHECK) &&
      dto.user.isRole(RoleEnum.FREE)
    )
      throw new Error("Free users can only create random or review quizzes")

    const quizId = randomUUID()
    const props: QuizProps = {
      quizId,
      quizType: dto.quizType,
      user: dto.user,
      discipline: dto.discipline,
      topicsRoot: QuizTopicList.create(quizId, []),
      answers: QuizAnswerList.create(quizId, []),
      isActive: true,
      createdAt: DateBr.create(),
      updatedAt: null,
    }
    return new Quiz(props)
  }

  public static toDomain(dto: QuizState): Quiz {
    if (!dto.quizId || !dto.quizType || !dto.user || !dto.discipline || !dto.answers || !dto.createdAt) {
      throw new Error("Missing required properties")
    }

    const quizTopicList = QuizTopicList.create(dto.quizId, [])
    dto.discipline.topicsRoot().forEach((topic: Topic) => {
      if (dto.topicsRootId.includes(topic.topicId)) {
        quizTopicList.add(topic)
      }
    })

    const quizAnswerList = QuizAnswerList.create(dto.quizId, [])
    dto.answers.forEach((answer) => {
      quizAnswerList.add(answer)
    })

    return new Quiz({
      quizId: dto.quizId,
      isActive: !!dto.isActive,
      user: dto.user,
      discipline: dto.discipline,
      quizType: dto.quizType,
      topicsRoot: quizTopicList,
      answers: quizAnswerList,
      createdAt: DateBr.create(dto.createdAt),
      updatedAt: dto.updatedAt ? DateBr.create(dto.updatedAt) : null,
    })
  }

  get quizId(): string {
    return this.props.quizId
  }

  get quizType(): QuizType {
    return this.props.quizType
  }

  get user(): User {
    return this.props.user
  }

  get discipline(): Discipline {
    return this.props.discipline
  }

  get topicsRoot(): QuizTopicList {
    return this.props.topicsRoot
  }

  get topics(): Topic[] {
    const topicList: Topic[] = []
    this.topicsRoot.getItems().forEach((topicRoot) => {
      this.discipline.topics
        .getItems()
        .filter((topic: Topic) => topic.topicRootId === topicRoot.topicId)
        .forEach((topic: Topic) => topicList.push(topic))
    })
    return topicList
  }

  get answers(): QuizAnswerList {
    return this.props.answers
  }

  get isActive(): boolean {
    return this.props.isActive
  }

  get createdAt(): DateBr {
    return this.props.createdAt
  }

  get updatedAt(): DateBr | null {
    return this.props.updatedAt
  }

  activate() {
    this.props.isActive = true
  }

  deactivate() {
    this.props.isActive = false
  }

  public toDTO(): QuizDTO {
    return {
      quizId: this.props.quizId,
      quizType: this.props.quizType.value,
      userId: this.props.user.userId,
      discipline: this.props.discipline.toDTO(),
      topicsRoot: this.props.topicsRoot.toDTO(),
      answers: this.props.answers.toDTO(),
      isActive: this.props.isActive,
      createdAt: this.props.createdAt.formatoBr,
      updatedAt: this.props.updatedAt ? this.props.updatedAt.formatoBr : null,
    }
  }

  public updateQuizType(quizType: QuizType) {
    if (
      (quizType.value === QuizTypeEnum.LEARNING || quizType.value === QuizTypeEnum.CHECK) &&
      this.user.isRole(RoleEnum.FREE)
    ) {
      throw new Error("Free users can only create random or review quizzes")
    }
    this.props.quizType = quizType
  }

  public topic({ topicId, name }: { topicId?: string; name?: string }): Topic | null {
    if (topicId) {
      const topic = this.topics.find((t) => t.topicId === topicId)
      return topic ? topic : null
    }
    if (name) {
      const topic = this.topics.filter((topic) => topic.name.toLowerCase() === name.toLowerCase())[0]
      return topic ? topic : null
    }
    return null
  }
}

export interface CreateQuizCommand {
  user: User
  discipline: Discipline
  quizType?: QuizType
}
