import { Quiz } from "../../../domain/entity/Quiz"
import { User } from "../../../domain/entity/User"
import { Discipline } from "../../../domain/entity/Discipline"
import { Topic } from "../../../domain/entity/Topic"
import { DisciplineRepository } from "../../repository/DisciplineRepository"
import { QuizRepository } from "../../repository/QuizRepository"
import { UserRepository } from "../../repository/UserRepository"
import { QuizType } from "../../../domain/valueObject/QuizType"

export class CreateQuiz {
  constructor(
    private quizRepository: QuizRepository,
    private userRepository: UserRepository,
    private disciplineRepository: DisciplineRepository
  ) {}

  async execute(dto: CreateQuizCommand): Promise<Output> {
    const user = await this.validateUser(dto.userId)
    const discipline = await this.validateDiscipline(dto.disciplineId)

    const topics = this.filterAndValidateTopics(discipline, dto.topicsRoot)

    if (!dto.quizType) dto.quizType = "random"
    const quizType = QuizType.create(dto.quizType)
    const oldQuiz = await this.quizRepository.getAll({
      userId: user.userId,
      disciplineId: discipline.disciplineId,
    })
    let quiz: Quiz
    if (oldQuiz.length > 0) {
      quiz = oldQuiz[0]
      quiz.activate()
      quiz.updateQuizType(quizType)
      quiz.topicsRoot.clear()
    } else {
      quiz = Quiz.create({ user, discipline, quizType })
    }
    topics.forEach((topic: Topic) => {
      quiz.topicsRoot.add(topic)
    })
    await this.quizRepository.save(quiz)
    return { quizId: quiz.quizId }
  }

  private async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.getById(userId)
    if (!user) {
      throw new Error(`User ID:${userId} does not exist!`)
    }
    return user
  }

  private async validateDiscipline(disciplineId: string): Promise<Discipline> {
    const discipline = await this.disciplineRepository.getById(disciplineId)
    if (!discipline) {
      throw new Error(`Discipline ID:${disciplineId} does not exist!`)
    }
    return discipline
  }

  private filterAndValidateTopics(discipline: Discipline, topicIds: string[]): Topic[] {
    // If no topics provided, return all root topics
    if (topicIds.length === 0) {
      return discipline.topicsRoot()
    }

    const topics = discipline.topics.getItems().filter((topic: Topic) => topicIds.includes(topic.topicId) && topic.isActive)

    if (topics.length === 0) {
      throw new Error("No root topics provided")
    }

    return topics
  }
}

type CreateQuizCommand = {
  userId: string
  disciplineId: string
  topicsRoot: string[]
  quizType?: string
}

type Output = { quizId: string }

//   As frequências são o percentual do total de questões recursivamente do assunto atual em relação
//   ao total de questões recursivamente de todos os assuntos da disciplina
// - QARec = qtde perguntas do assunto atual + perguntas assuntos recursivamente (todos assuntos-filhos),
// - SomaQARec = Maior Soma de QARec de todos os assuntos root da disciplina (para normalização),
// - Profundidade = Qtde assuntos-pais + 1 (próprio nível)
// - F = (QARec / SomaQARec)  // assunto root mais frequente = 1

//   qtyAllQuestionsTopicRoot => qtyQuestions + qtyQuestionsRecursive
//   Profundidade => depth
//   A frequencia é calculada por profundidade (recursivamente)  // assunto mais frequente na profundidade = 1
//   frequencyDepth = (qtyQuestions + qtyQuestionsRecursive) / Max(qtyQuestions + qtyQuestionsRecursive)

//  Considerar a frequencia do assunto root na prioridade das questões (mais questões para assuntos mais frequentes)
//  De forma a aproveitar que as questões já estão classificadas por assunto root
//  Selecionado o próximo assunto, selecionar o micro-assunto com base na frequencia dentro daquela profundidade
//  de modo a sequenciar as questões seguindo a profundidade dos assuntos (mais geral para mais específico)
//  o aprendizado deve ser nivelado do geral para o específico
//  todas as questões serão movidas para o assunto "A classificar" de forma a não impactarem na frequencia dos assuntos e o assunto "A classificar" será mostrado nos gráficos como sendo o assunto root
// caso haja o assunto "Conceito", o mesmo será mostrado nos gráficos como sendo o assunto pai
