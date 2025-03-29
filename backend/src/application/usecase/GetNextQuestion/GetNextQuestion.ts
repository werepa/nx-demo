import { UseCase } from "../../../shared/domain/entity/UseCase"
import { Question } from "../../../domain/entity/Question"
import { QuestionRepository } from "../../repository/QuestionRepository"
import { LearningRepository } from "../../repository/LearningRepository"
import { QuizRepository } from "../../repository/QuizRepository"
import { Learning } from "../../../domain/entity/Learning"
import { Quiz } from "../../../domain/entity/Quiz"
import { QuizAnswer } from "../../../domain/entity/QuizAnswer"
import { TopicLearning } from "../../../domain/entity/TopicLearning"

export class GetNextQuestion implements UseCase {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly quizRepository: QuizRepository,
    private readonly learningRepository: LearningRepository
  ) {}

  async execute(dto: GetNextQuestionCommand): Promise<Question> {
    let nextQuestion = null
    const quiz = await this.quizRepository.getById(dto.quizId)

    if (!quiz) {
      throw new Error("Quiz not found!")
    }
    if (!quiz.user || !quiz.discipline) {
      throw new Error("Invalid quiz: missing user or discipline!")
    }

    const learning = await this.learningRepository.getDisciplineLearning(quiz.user, quiz.discipline)

    // verify if is leveling phase
    const verifyLeveling = await this.verifyLeveling(learning, quiz)
    if (verifyLeveling.isLeveling) {
      nextQuestion = await this.getNextQuestionLeveling(verifyLeveling.levelingTopics, quiz, learning)
    } else {
      nextQuestion = await this.getNextQuestionLearningByFrequency(quiz, learning, dto.randomWait)
    }
    return nextQuestion
  }

  // leveling = verify if exists topicLearning with qtyQuestionsAnswered < 2 and qtyQuestions >= 2 and topicLearning.topic.topicRootId in quiz.topicsRoot
  private async verifyLeveling(
    learning: Learning,
    quiz: Quiz
  ): Promise<{ isLeveling: boolean; levelingTopics: TopicLearning[] }> {
    const levelingTopics = learning.topics
      .getItems()
      .filter(
        (topicLearning: TopicLearning) =>
          topicLearning.qtyQuestionsAnswered() < 2 &&
          topicLearning.qtyQuestions >= 2 &&
          quiz?.topicsRoot.find(topicLearning.topic.topicRootId)
      )
    return {
      isLeveling: levelingTopics.length > 0,
      levelingTopics,
    }
  }

  private async getNextQuestionLeveling(levelingTopics: TopicLearning[], quiz: Quiz, learning: Learning): Promise<Question> {
    let nextQuestion = null
    // Order levelingTopics by qtyQuestionsAnswered ASC, score ASC and frequencyInDiscipline DESC
    levelingTopics.sort((a: TopicLearning, b: TopicLearning) => {
      if (a.qtyQuestionsAnswered() < b.qtyQuestionsAnswered()) return -1
      if (a.qtyQuestionsAnswered() > b.qtyQuestionsAnswered()) return 1
      if (a.score() < b.score()) return -1
      if (a.score() > b.score()) return 1
      if (a.frequencyInDiscipline > b.frequencyInDiscipline) return -1
      if (a.frequencyInDiscipline < b.frequencyInDiscipline) return 1
      if (a.topic.name < b.topic.name) return -1
      if (a.topic.name > b.topic.name) return 1
      return 0
    })

    // get next question from levelingTopics
    const lista = []
    while (levelingTopics.length > 0 && !nextQuestion) {
      const nextTopic = levelingTopics[0].topic

      lista.push(nextTopic.name)

      // get a random question from nextTopic that don't exists in learning.history
      nextQuestion = await this.questionRepository.getRandom({
        topicId: nextTopic.topicId,
        userId: learning.user.userId,
        topicsRoot: quiz?.topicsRoot.listId() ?? [],
      })

      // remove topic from levelingTopics if no question was found
      if (!nextQuestion) {
        levelingTopics.shift()
      }
    }

    // TODO: remove this
    // if (learning.history.getCount() >= 0) {
    //   console.log("lista:", lista)
    // }

    if (!nextQuestion) {
      throw new Error("No questions found!")
    }

    return nextQuestion
  }
  // Simulado por frequência dos assuntos => Prioriza FrequencyInDiscipline, selecionando questões do menor nível de aprendizado do usuário, incluíndo também do próximo nível, de forma a reforçar os mesmos tópicos até que evoluam para dois níveis acima do nível de aprendizado mais baixo do usuário
  private async getNextQuestionLearningByFrequency(quiz: Quiz, learning: Learning, randomWait = 10): Promise<Question> {
    const MIN_QUIZ_TOPICS = 10
    let nextQuestion: Question

    // Select topics from lowerest learning, if quantity of topics lower than 10 increase level limit until get MIN_QUIZ_TOPICS or more topics
    let maxLearning = 2 // Iniciante
    let selectedLearningTopics: TopicLearning[] = []
    while (selectedLearningTopics.length < MIN_QUIZ_TOPICS && maxLearning < 8) {
      selectedLearningTopics =
        learning.topics.getItems().filter((topicLearning) => {
          // Tolerância para selecionar questões no próximo nível, de forma a priorizar frequencyInDepth na próxima etapa de refinamento
          if (
            quiz.topicsRoot.find(topicLearning.topic.topicRootId) &&
            topicLearning.qtyQuestions >= 2 &&
            topicLearning.learning() <= maxLearning + 1
          ) {
            return topicLearning
          }
          return []
        }) || []
      maxLearning++
    }

    // Order by frequencyInDiscipline DESC, learning ASC, score ASC, qtyQuestionAsnwered ASC, name ASC
    selectedLearningTopics = selectedLearningTopics
      .filter((topicLearning) => quiz.topicsRoot.find(topicLearning.topic.topicRootId))
      .sort((a: TopicLearning, b: TopicLearning) => {
        if (a.frequencyInDiscipline > b.frequencyInDiscipline) return -1
        if (a.frequencyInDiscipline < b.frequencyInDiscipline) return 1
        if (a.learning() < b.learning()) return -1
        if (a.learning() > b.learning()) return 1
        if (a.score() < b.score()) return -1
        if (a.score() > b.score()) return 1
        if (a.qtyQuestionsAnswered() < b.qtyQuestionsAnswered()) return -1
        if (a.qtyQuestionsAnswered() > b.qtyQuestionsAnswered()) return 1
        if (a.topic.name < b.topic.name) return -1
        if (a.topic.name > b.topic.name) return 1
        return 0
      })

    let wait = randomWait >= 0 ? Math.floor(Math.random() * randomWait) + 10 : 5
    if (wait > selectedLearningTopics.length - 1) wait = selectedLearningTopics.length - 1
    let learningTopicsAfterRandomWait = [...selectedLearningTopics]
    const historyFiltered = wait ? learning.history.getShortHistory(wait) : []
    historyFiltered.forEach((userQuizAnswer: QuizAnswer) => {
      learningTopicsAfterRandomWait = learningTopicsAfterRandomWait.filter(
        (topicLearning) => topicLearning.topic.topicId !== userQuizAnswer.topicId
      )
    })

    selectedLearningTopics = learningTopicsAfterRandomWait.length ? learningTopicsAfterRandomWait : selectedLearningTopics

    // get next question from selectedLearningTopics
    const lista = []
    let counter = 0
    while (!nextQuestion && counter < 3) {
      const nextTopic = selectedLearningTopics[0].topic

      lista.push(nextTopic.name)

      // get a random question from nextTopic that don't exists in learning.history
      nextQuestion = await this.questionRepository.getRandom({
        topicId: nextTopic.topicId,
        userId: learning.user.userId,
        topicsRoot: quiz.topicsRoot.listId(),
      })

      // Should update flag "can_repeat" to true in table quiz_answer
      if (!nextQuestion) {
        // console.log("resetCanRepeat", learning.user.userId, nextTopic.topicId)
        await this.quizRepository.resetCanRepeat(learning.user.userId, nextTopic.topicId)
      }

      counter++
    }

    // TODO: remove this
    // if (learning.history.getCount() >= 0) {
    //   console.log("lista:", lista)
    //   const sltLista = []
    //   selectedLearningTopics.forEach((topicLearning) => {
    //     sltLista.push(topicLearning.topic.name, topicLearning.learning())
    //   })
    //   console.log("sltLista:", sltLista)
    // }

    if (!nextQuestion) {
      throw new Error("No questions found!")
    }

    return nextQuestion
  }
}

type GetNextQuestionCommand = {
  quizId: string
  randomWait?: number // number of questions to wait before repeat a topic (10+randomWait)
}
