import { Topic } from '../../domain/entity/Topic';
import { Discipline } from '../../domain/entity/Discipline';
import { TopicList } from '../../domain/entity/TopicList';
import { topicMock, disciplineMock } from './disciplineMock';
import { DateBr } from '../../shared/domain/valueObject/DateBr';

describe('DisciplineMock', () => {
  it('should return a Discipline', () => {
    let discipline = disciplineMock();
    expect(discipline).toBeInstanceOf(Discipline);
    expect(discipline.id).toHaveLength(36);
    expect(discipline.name).toBeDefined();
    expect(discipline.topics).toEqual(
      TopicList.create(discipline.disciplineId, [])
    );
    expect(discipline.isActive).toBeTruthy();
    expect(discipline.createdAt).toBeInstanceOf(DateBr);
    expect(discipline.createdAt).toBeDefined();
    expect(discipline.updatedAt).toBeNull();

    discipline = disciplineMock({ name: 'Matemática' });
    expect(discipline.name).toBe('Matemática');
  });

  it('should return a Topic', () => {
    let topic = topicMock();
    expect(topic).toBeInstanceOf(Topic);
    expect(topic.id).toHaveLength(36);
    expect(topic.name).toBeDefined();
    expect(topic.isActive).toBeTruthy();
    expect(topic.createdAt).toBeInstanceOf(DateBr);
    expect(topic.createdAt).toBeDefined();
    expect(topic.updatedAt).toBeNull();

    topic = topicMock({ name: 'Algebra' });
    expect(topic.name).toBe('Algebra');
  });
});
