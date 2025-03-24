import { CreateQuizCommand, Quiz } from "./Quiz"
import { DateBr } from "../../shared/domain/valueObject/DateBr"
import { QuizTopicList } from "./QuizTopicList"
import { Discipline } from "./Discipline"
import { faker } from "@faker-js/faker"
import { disciplineMock } from "../../tests/mocks/disciplineMock"
import { userMock } from "../../tests/mocks"
import { Topic } from "./Topic"
import { User } from "./User"
import { RoleEnum, QuizTypeEnum } from "../../shared/enum"
import { UserRole, QuizType } from "../valueObject"
import { QuizState } from "../../shared/models"

describe("Entity => Quiz", () => {
  let quiz: Quiz
  let portugues: Discipline
  let portuguesClassificar: Topic
  let pronomes: Topic
  let pessoais: Topic
  let casoReto: Topic
  let obliquos: Topic
  let tratamento: Topic
  let crase: Topic
  let palavrasRepetidas: Topic
  let palavrasMasculinas: Topic
  let palavrasEspeciais: Topic
  let distancia: Topic
  let terra: Topic
  let nomesCidades: Topic
  let userFree: User
  let userMember: User

  beforeAll(() => {
    userFree = userMock({ name: "User Free" })
    userMember = userMock({ name: "User Member" })
    userMember.updateRole(UserRole.create(RoleEnum.MEMBER))

    portugues = disciplineMock({ name: "Português" })
    portuguesClassificar = portugues.topics.getItems()[0]
    pronomes = Topic.create({ name: "Pronomes" })
    pessoais = Topic.create({ name: "Pessoais" })
    casoReto = Topic.create({ name: "Caso reto" })
    obliquos = Topic.create({ name: "Oblíquos" })
    tratamento = Topic.create({ name: "Tratamento" })
    crase = Topic.create({ name: "Crase" })
    palavrasRepetidas = Topic.create({ name: "Palavras repetidas" })
    palavrasMasculinas = Topic.create({ name: "Palavras masculinas" })
    palavrasEspeciais = Topic.create({ name: "Palavras especiais" })
    distancia = Topic.create({ name: "Distância" })
    terra = Topic.create({ name: "Terra" })
    nomesCidades = Topic.create({ name: "Nomes de cidades" })

    portugues.topics.add(pronomes)
    portugues.topics.add(pessoais)
    portugues.topics.add(casoReto)
    portugues.topics.add(obliquos)
    portugues.topics.add(tratamento)
    portugues.topics.add(crase)
    portugues.topics.add(palavrasRepetidas)
    portugues.topics.add(palavrasMasculinas)
    portugues.topics.add(palavrasEspeciais)
    portugues.topics.add(distancia)
    portugues.topics.add(terra)
    portugues.topics.add(nomesCidades)

    portugues.setTopicParent({ topic: pessoais, topicParent: pronomes })
    portugues.setTopicParent({ topic: casoReto, topicParent: pessoais })
    portugues.setTopicParent({ topic: obliquos, topicParent: pessoais })
    portugues.setTopicParent({ topic: tratamento, topicParent: pronomes })
    portugues.setTopicParent({ topic: palavrasRepetidas, topicParent: crase })
    portugues.setTopicParent({ topic: palavrasMasculinas, topicParent: crase })
    portugues.setTopicParent({ topic: palavrasEspeciais, topicParent: crase })
    portugues.setTopicParent({
      topic: distancia,
      topicParent: palavrasEspeciais,
    })
    portugues.setTopicParent({ topic: terra, topicParent: palavrasEspeciais })
    portugues.setTopicParent({ topic: nomesCidades, topicParent: crase })
  })

  it("should create a quiz with the correct parameters", () => {
    const dto: CreateQuizCommand = {
      user: userFree,
      discipline: portugues,
    }
    quiz = Quiz.create(dto)
    expect(quiz).toBeInstanceOf(Quiz)
    expect(quiz.quizId).toHaveLength(36)
    expect(quiz.quizType.value).toBe(QuizTypeEnum.RANDOM)
    expect(quiz.user).toEqual(dto.user)
    expect(quiz.discipline).toEqual(dto.discipline)
    expect(quiz.topicsRoot).toBeInstanceOf(QuizTopicList)
    expect(quiz.topicsRoot.listId()).toHaveLength(0)
    expect(quiz.answers.getItems()).toEqual([])
    expect(quiz.isActive).toBe(true)
    expect(quiz.createdAt).toBeInstanceOf(DateBr)
    expect(quiz.updatedAt).toBeNull()

    expect(() => Quiz.create({ ...dto, quizType: QuizType.create(QuizTypeEnum.LEARNING) })).toThrow(
      "Free users can only create random or review quizzes"
    )

    quiz = Quiz.create({
      user: userMember,
      discipline: portugues,
      quizType: QuizType.create(QuizTypeEnum.LEARNING),
    })
    expect(quiz).toBeInstanceOf(Quiz)
    expect(quiz.quizId).toHaveLength(36)
    expect(quiz.quizType.value).toBe(QuizTypeEnum.LEARNING)
  })

  it("should convert persistence object to Domain correctly", () => {
    const dto: QuizState = {
      quizId: faker.string.uuid(),
      quizType: QuizType.create(QuizTypeEnum.RANDOM),
      user: userFree,
      discipline: portugues,
      topicsRootId: [pronomes.topicId, crase.topicId],
      answers: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    quiz = Quiz.toDomain(dto)
    expect(quiz).toBeInstanceOf(Quiz)
    expect(quiz.quizId).toBe(dto.quizId)
    expect(quiz.quizType).toEqual(dto.quizType)
    expect(quiz.user.userId).toBe(dto.user.userId)
    expect(quiz.discipline.disciplineId).toBe(dto.discipline.disciplineId)
    expect(quiz.topicsRoot).toBeInstanceOf(QuizTopicList)
    expect(quiz.topicsRoot.listId()).toHaveLength(2)
    expect(quiz.answers.getItems()).toEqual(dto.answers)
    expect(quiz.isActive).toBe(dto.isActive)
    expect(quiz.createdAt.value).toBe(dto.createdAt)
    expect(quiz.updatedAt?.value).toBe(dto.updatedAt)
  })

  it("should convert Quiz to DTO", () => {
    const discipline = disciplineMock({ name: "Português" })
    discipline.topics.add(Topic.create({ name: "Pronomes" }))
    discipline.topics.add(Topic.create({ name: "Crase" }))
    const quiz = Quiz.create({ user: userFree, discipline: portugues })

    const quizDTO = quiz.toDTO()
    expect(quizDTO.quizId).toBe(quiz.quizId)
    expect(quizDTO.quizType).toBe(quiz.quizType.value)
    expect(quizDTO.userId).toEqual(quiz.user.userId)
    expect(quizDTO.discipline).toEqual(quiz.discipline.toDTO())
    expect(quizDTO.topicsRoot).toEqual(quiz.topicsRoot.listId())
    expect(quizDTO.answers).toEqual(quiz.answers.getItems())
    expect(quizDTO.isActive).toBe(quiz.isActive)
    expect(quizDTO.createdAt).toBe(quiz.createdAt.value)
    expect(quizDTO.updatedAt).toBe(null)
  })

  it("should update quizType correctly", () => {
    const dto: CreateQuizCommand = {
      user: userMember,
      discipline: portugues,
    }
    quiz = Quiz.create(dto)
    expect(quiz.quizType.value).toBe(QuizTypeEnum.RANDOM)
    quiz.updateQuizType(QuizType.create(QuizTypeEnum.LEARNING))
    expect(quiz.quizType.value).toBe(QuizTypeEnum.LEARNING)
  })

  it("should return a topic by topicId", () => {
    const dto: CreateQuizCommand = {
      user: userFree,
      discipline: portugues,
    }
    quiz = Quiz.create(dto)

    quiz.topicsRoot.add(pronomes)
    quiz.topicsRoot.add(crase)

    const topic = quiz.topic({ topicId: pronomes.topicId })
    expect(topic).toBeInstanceOf(Topic)
    expect(topic?.name).toBe("Pronomes")
  })

  it("should return a topic by name", () => {
    const dto: CreateQuizCommand = {
      user: userFree,
      discipline: portugues,
    }
    quiz = Quiz.create(dto)
    quiz.topicsRoot.add(pronomes)
    quiz.topicsRoot.add(crase)
    const topic = quiz.topic({ name: "Pronomes" })
    expect(topic).toBeInstanceOf(Topic)
    expect(topic?.name).toBe("Pronomes")
  })

  it("should return null if topicId does not exist", () => {
    const dto: CreateQuizCommand = {
      user: userFree,
      discipline: portugues,
    }
    quiz = Quiz.create(dto)
    const topic = quiz.topic({ topicId: "non_existing_id" })
    expect(topic).toBeNull()
  })

  it("should return null if topic name does not exist", () => {
    const dto: CreateQuizCommand = {
      user: userFree,
      discipline: portugues,
    }
    quiz = Quiz.create(dto)
    const topic = quiz.topic({ name: "Non-existing topic" })
    expect(topic).toBeNull()
  })

  it("should return null if topic has no parameters", () => {
    const dto: CreateQuizCommand = {
      user: userFree,
      discipline: portugues,
    }
    quiz = Quiz.create(dto)
    const topic = quiz.topic({})
    expect(topic).toBeNull()
  })

  describe("Quiz DTO Validation", () => {
    it("should throw an error if quizId is missing", () => {
      const dto = {
        quizType: "type",
        userId: "user",
        disciplineId: "discipline",
        topicsRootId: "root",
        createdAt: new Date(),
      }
      // @ts-expect-error missing quizId
      expect(() => Quiz.toDomain(dto)).toThrow("Missing required properties")
    })

    it("should throw an error if quizType is missing", () => {
      const dto = {
        quizId: "id",
        userId: "user",
        disciplineId: "discipline",
        topicsRootId: "root",
        createdAt: new Date(),
      }
      // @ts-expect-error missing quizType
      expect(() => Quiz.toDomain(dto)).toThrow("Missing required properties")
    })

    it("should throw an error if userId is missing", () => {
      const dto = {
        quizId: "id",
        quizType: "type",
        disciplineId: "discipline",
        topicsRootId: "root",
        createdAt: new Date(),
      }
      // @ts-expect-error missing userId
      expect(() => Quiz.toDomain(dto)).toThrow("Missing required properties")
    })

    it("should throw an error if disciplineId is missing", () => {
      const dto = {
        quizId: "id",
        quizType: "type",
        userId: "user",
        topicsRootId: "root",
        createdAt: new Date(),
      }
      // @ts-expect-error missing disciplineId
      expect(() => Quiz.toDomain(dto)).toThrow("Missing required properties")
    })

    it("should throw an error if topicsRootId is missing", () => {
      const dto = {
        quizId: "id",
        quizType: "type",
        userId: "user",
        disciplineId: "discipline",
        createdAt: new Date(),
      }
      // @ts-expect-error missing topicsRootId
      expect(() => Quiz.toDomain(dto)).toThrow("Missing required properties")
    })

    it("should throw an error if createdAt is missing", () => {
      const dto = {
        quizId: "id",
        quizType: "type",
        userId: "user",
        disciplineId: "discipline",
        topicsRootId: "root",
      }
      // @ts-expect-error missing createdAt
      expect(() => Quiz.toDomain(dto)).toThrow("Missing required properties")
    })
  })
})
