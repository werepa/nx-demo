import { QuizTopicList } from './QuizTopicList';
import { Topic } from './Topic';
import { Discipline } from './Discipline';
import { disciplineMock } from '../../tests/mocks/disciplineMock';

describe('Entity => QuizTopicList', () => {
  let quizTopicList: QuizTopicList;
  let portugues: Discipline;
  let crase: Topic;
  let pronomes: Topic;
  let palavrasRepetidas: Topic;
  let terra: Topic;

  beforeAll(() => {
    portugues = disciplineMock({ name: 'Português' });
    crase = Topic.create({ name: 'Crase' });

    pronomes = Topic.create({ name: 'Pronomes' });
    palavrasRepetidas = Topic.create({ name: 'Palavras repetidas' });
    terra = Topic.create({ name: 'Terra' });

    portugues.topics.add(crase);
    portugues.topics.add(pronomes);
    portugues.topics.add(palavrasRepetidas);
    portugues.topics.add(terra);

    portugues.setTopicParent({ topic: palavrasRepetidas, topicParent: crase });
    quizTopicList = QuizTopicList.create(portugues.disciplineId, [
      crase,
      pronomes,
    ]);
  });

  it('should create a QuizTopicList instance', () => {
    expect(quizTopicList).toBeInstanceOf(QuizTopicList);
    expect(quizTopicList.getItems()).toHaveLength(2);
  });

  it('should add a valid topic', () => {
    quizTopicList.remove(terra);
    expect(quizTopicList.getItems()).toHaveLength(2);
    expect(quizTopicList.getItems()).not.toContain(terra);
    quizTopicList.add(terra);
    expect(quizTopicList.getItems()).toHaveLength(3);
    expect(quizTopicList.getItems()).toContain(terra);
  });

  it('should throw an error when adding a topic that already exists', () => {
    expect(() => quizTopicList.add(crase)).toThrow(
      `Topic ID:${crase.topicId} already in the list!`
    );
  });

  it('should throw an error when adding a topic with a parent ID', () => {
    expect(() => quizTopicList.add(palavrasRepetidas)).toThrow(
      'Only Topics Root are allowed!'
    );
  });

  it('should throw an error when adding a null or undefined topic', () => {
    // @ts-ignore
    expect(() => quizTopicList.add(null)).toThrow('Topic is required');
    // @ts-ignore
    expect(() => quizTopicList.add(undefined)).toThrow('Topic is required');
  });

  it('should remove a topic', () => {
    const acentuacao = Topic.create({ name: 'Acentuação' });
    quizTopicList.add(acentuacao);
    expect(quizTopicList.getItems()).toHaveLength(4);
    quizTopicList.remove(acentuacao);
    expect(quizTopicList.getItems()).toHaveLength(3);
    expect(quizTopicList.getItems()).not.toContain(acentuacao);
  });

  it('should not throw an error when removing a topic that does not exist!', () => {
    const nonExistentTopic = Topic.create({ name: 'NonExistent' });
    expect(() => quizTopicList.remove(nonExistentTopic)).not.toThrow();
  });

  it('should sort topics correctly', () => {
    const items = quizTopicList.getItems();
    expect(items[0].name).toBe('Crase');
    expect(items[1].name).toBe('Pronomes');
    expect(items[2].name).toBe('Terra');
  });

  it('should replace special characters in sorting', () => {
    const topicWithSpecialChar = Topic.create({ name: 'Êxito' });
    quizTopicList.add(topicWithSpecialChar);
    const items = quizTopicList.getItems();
    expect(items[0].name).toBe('Crase');
    expect(items[1].name).toBe('Êxito');
    expect(items[2].name).toBe('Pronomes');
    expect(items[3].name).toBe('Terra');
  });
});
