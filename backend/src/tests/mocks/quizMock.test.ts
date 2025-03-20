import { quizMock, quizMockFromPersistence } from './quizMock';
import { User } from '../../domain/entity/User';
import { Discipline } from '../../domain/entity/Discipline';
import { Quiz } from '../../domain/entity/Quiz';
import { userMock } from './userMock';
import { disciplineMock, topicMock } from './disciplineMock';

describe('quizMock', () => {
  it('should create a quiz persistence with default values', () => {
    const quizPersistence = quizMockFromPersistence();
    expect(quizPersistence).toBeDefined();
    expect(quizPersistence.quizId).toBeDefined();
    expect(quizPersistence.userId).toBeDefined();
    expect(quizPersistence.disciplineId).toBeDefined();
    expect(quizPersistence.topicsRootId).toBeDefined();
    expect(quizPersistence.createdAt).toBeDefined();
  });

  it('should create a quiz with default values', () => {
    const quiz = quizMock();
    expect(quiz).toBeInstanceOf(Quiz);
    expect(quiz.quizId).toBeDefined();
    expect(quiz.user).toBeInstanceOf(User);
    expect(quiz.discipline).toBeInstanceOf(Discipline);
    expect(quiz.topicsRoot.getItems()).toHaveLength(3);
  });

  it('should create a quiz with custom values', () => {
    const user = userMock();
    const discipline = disciplineMock();
    const topic1 = topicMock({ name: 'topic 1' });
    const topic2 = topicMock({ name: 'topic 2' });
    discipline.topics.add(topic1);
    discipline.topics.add(topic2);
    const quiz = quizMock({ quizId: 'any_id', user, discipline });
    expect(quiz.quizId).toBe('any_id');
    expect(quiz.user).toBe(user);
    expect(quiz.discipline).toBe(discipline);
    expect(quiz.topicsRoot.getItems()).toHaveLength(2);
  });
});
