import { faker } from "@faker-js/faker"
import { CreateQuizAnswer } from "./CreateQuizAnswer"
import { CreateQuizAnswerCommand, Discipline, Question, Quiz, QuizAnswer, Topic, User } from "../../../domain/entity"
import { disciplineMock, topicMock } from "../../../tests/mocks/disciplineMock"
import { UserRole } from "../../../domain/valueObject"
import {
  DisciplineRepositoryDatabase,
  QuestionRepositoryDatabase,
  QuizRepositoryDatabase,
  UserRepositoryDatabase,
} from "../../../infra/repository"
import { DisciplineRepository, QuestionRepository, QuizRepository, UserRepository } from "../../repository"
import { DatabaseConnection, getTestDatabaseAdapter } from "../../../infra/database"
import { RoleEnum } from "../../../shared/enum"
import { getCorrectOption, getIncorrectOption, userMock } from "../../../tests/mocks"

describe("CreateQuizAnswer", () => {
  let connection: DatabaseConnection
  let userRepository: UserRepository
  let disciplineRepository: DisciplineRepository
  let questionRepository: QuestionRepository
  let quizRepository: QuizRepository
  let createQuizAnswer: CreateQuizAnswer

  let userMember: User
  let portugues: Discipline
  let crase: Topic
  let quiz: Quiz
  let question1: Question
  let question2: Question
  let question3: Question
  let question4: Question

  beforeEach(async () => {
    connection = getTestDatabaseAdapter()

    userRepository = new UserRepositoryDatabase(connection)
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
    questionRepository = new QuestionRepositoryDatabase(connection)
    quizRepository = new QuizRepositoryDatabase(connection, userRepository, disciplineRepository)

    await quizRepository.clear()
    await questionRepository.clear()
    await disciplineRepository.clear()
    await userRepository.clear()

    createQuizAnswer = new CreateQuizAnswer(quizRepository, questionRepository)

    const userMember = userMock({ name: "User Member" })
    userMember.updateRole(UserRole.create(RoleEnum.MEMBER))
    await userRepository.save(userMember)

    portugues = disciplineMock({ name: "Português" })
    crase = topicMock({ name: "Crase" })
    portugues.topics.add(crase)
    await disciplineRepository.save(portugues)

    question1 = Question.create({
      topicId: crase.topicId,
      topicRootId: crase.topicId,

      prompt: "Question 1",
      options: [
        { text: "Option 1", isCorrectAnswer: true },
        { text: "Option 2", isCorrectAnswer: false },
      ],
    })
    question2 = Question.create({
      topicId: crase.topicId,
      topicRootId: crase.topicId,
      prompt: "Question 2",
      options: [
        { text: "Option 1", isCorrectAnswer: true },
        { text: "Option 2", isCorrectAnswer: false },
      ],
    })
    question3 = Question.create({
      topicId: crase.topicId,
      topicRootId: crase.topicId,
      prompt: "Question 3",
      options: [{ text: "Option 1", isCorrectAnswer: true }],
    })
    question4 = Question.create({
      topicId: crase.topicId,
      topicRootId: crase.topicId,
      prompt: "Question 4",
      options: [{ text: "Option 1", isCorrectAnswer: false }],
    })
    await questionRepository.save(question1)
    await questionRepository.save(question2)
    await questionRepository.save(question3)
    await questionRepository.save(question4)

    quiz = Quiz.create({
      discipline: portugues,
      user: userMember,
    })
    quiz.topicsRoot.add(crase)
    await quizRepository.save(quiz)
  })

  afterEach(() => {
    connection.close()
  })

  test("should create a quiz answer", async () => {
    const dto1: CreateQuizAnswerCommand = {
      quizId: quiz.quizId,
      questionId: question1.questionId,
      topicId: question1.topicId,
      correctOptionId: getCorrectOption(question1),
      userOptionId: getCorrectOption(question1),
    }
    let result = await createQuizAnswer.execute(dto1)
    expect(result).toBeInstanceOf(QuizAnswer)
    expect(result.quizId).toBe(quiz.quizId)
    expect(result.questionId).toBe(question1.questionId)
    expect(result.userOptionId).toBe(question1.options.getItems()[0].optionId)
    expect(result.isUserAnswerCorrect).toBe(true)
    expect(result.createdAt).toBeDefined()

    const dto2: CreateQuizAnswerCommand = {
      quizId: quiz.quizId,
      questionId: question2.questionId,
      topicId: question2.topicId,
      correctOptionId: getCorrectOption(question2),
      userOptionId: getIncorrectOption(question2),
    }
    result = await createQuizAnswer.execute(dto2)
    expect(result.isUserAnswerCorrect).toBe(false)

    const dto3: CreateQuizAnswerCommand = {
      quizId: quiz.quizId,
      questionId: question3.questionId,
      topicId: question3.topicId,
      correctOptionId: getCorrectOption(question3),
      userOptionId: getIncorrectOption(question3),
    }
    result = await createQuizAnswer.execute(dto3)
    expect(result.isUserAnswerCorrect).toBe(false)

    const dto4: CreateQuizAnswerCommand = {
      quizId: quiz.quizId,
      questionId: question3.questionId,
      topicId: question3.topicId,
      correctOptionId: getCorrectOption(question3),
      userOptionId: getIncorrectOption(question3),
    }
    result = await createQuizAnswer.execute(dto4)
    expect(result.isUserAnswerCorrect).toBe(true)

    const dto5: CreateQuizAnswerCommand = {
      quizId: quiz.quizId,
      questionId: question4.questionId,
      topicId: question4.topicId,
      correctOptionId: getCorrectOption(question4),
      userOptionId: getIncorrectOption(question4),
    }
    result = await createQuizAnswer.execute(dto5)
    expect(result.isUserAnswerCorrect).toBe(false)

    const dto6: CreateQuizAnswerCommand = {
      quizId: quiz.quizId,
      questionId: question4.questionId,
      topicId: question4.topicId,
      correctOptionId: getCorrectOption(question4),
      userOptionId: null,
    }
    result = await createQuizAnswer.execute(dto6)
    expect(result.isUserAnswerCorrect).toBe(true)
  })

  test("should throw an error if quiz does not exist!", async () => {
    const nonExistentQuizId = faker.string.uuid()
    const dto = {
      quizId: nonExistentQuizId,
      questionId: question1.questionId,
      userOptionId: question1.options.getItems()[0].optionId,
    }
    await expect(createQuizAnswer.execute(dto)).rejects.toThrow(`Quiz ID:${dto.quizId} does not exist!`)
  })

  test("should throw an error if question does not exist!", async () => {
    const nonExistentQuestionId = faker.string.uuid()
    const dto = {
      quizId: quiz.quizId,
      questionId: nonExistentQuestionId,
      userOptionId: question1.options.getItems()[0].optionId,
    }
    await expect(createQuizAnswer.execute(dto)).rejects.toThrow(`Question ID:${dto.questionId} does not exist!`)
  })

  test("should throw an error if option does not exist!", async () => {
    const nonExistentOptionId = faker.string.uuid()
    const dto = {
      quizId: quiz.quizId,
      questionId: question1.questionId,
      userOptionId: nonExistentOptionId,
    }
    await expect(createQuizAnswer.execute(dto)).rejects.toThrow(`Option ID:${dto.userOptionId} does not exist!`)
  })
})
