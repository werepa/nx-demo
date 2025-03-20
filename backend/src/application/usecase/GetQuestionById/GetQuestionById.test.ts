import { GetQuestionById } from './GetQuestionById';
import { QuestionRepository } from '../../repository/QuestionRepository';
import { Question } from '../../../domain/entity/Question';
import { faker } from '@faker-js/faker';
import { CreateQuestion } from '..';
import { DatabaseConnection } from '../../../infra/database/DatabaseConnection';
import { getTestDatabaseAdapter } from '../../../infra/database/TestDatabaseAdapter';
import { DisciplineRepositoryDatabase } from '../../../infra/repository/DisciplineRepositoryDatabase';
import { QuestionRepositoryDatabase } from '../../../infra/repository/QuestionRepositoryDatabase';
import { DisciplineRepository } from '../../repository/DisciplineRepository';
import { disciplineMock, topicMock } from '../../../tests/mocks/disciplineMock';

describe('GetQuestionById', () => {
  let connection: DatabaseConnection;
  let disciplineRepository: DisciplineRepository;
  let questionRepository: QuestionRepository;
  let createQuestion: CreateQuestion;
  let getQuestionById: GetQuestionById;

  beforeAll(async () => {
    connection = getTestDatabaseAdapter();

    disciplineRepository = new DisciplineRepositoryDatabase(connection);
    questionRepository = new QuestionRepositoryDatabase(connection);

    createQuestion = new CreateQuestion(questionRepository);
    getQuestionById = new GetQuestionById(questionRepository);
  });

  beforeEach(async () => {
    await questionRepository.clear();
    await disciplineRepository.clear();
  });

  afterAll(() => {
    connection.close();
  });

  test('should return a question by ID', async () => {
    const portugues = disciplineMock({ name: 'Português' });
    const crase = topicMock({ name: 'Crase' });
    portugues.topics.add(crase);
    await disciplineRepository.save(portugues);
    const savedQuestion = await createQuestion.execute({
      prompt: 'Sample Question',
      options: [
        { text: 'Option 1', key: true },
        { text: 'Option 2', key: false },
        { text: 'Option 3', key: false },
        { text: 'Option 4', key: false },
      ],
      topicId: crase.topicId,
      topicRootId: crase.topicId,
    });
    const question = await getQuestionById.execute(savedQuestion.questionId);
    expect(question).toBeInstanceOf(Question);
    expect(question).toEqual(savedQuestion);
  });

  test('should throw an error if question not found', async () => {
    const nonExistentQuestionId = faker.string.uuid();
    await expect(
      getQuestionById.execute(nonExistentQuestionId)
    ).rejects.toThrow(`Question ID:${nonExistentQuestionId} does not exist!`);
  });
});
