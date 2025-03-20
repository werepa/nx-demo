import { QuizTypeEnum } from '../../shared/enum';
import { QuizType } from './QuizType';

describe('QuizType', () => {
  it("should create a QuizType instance with default value 'random'", () => {
    const quizType = QuizType.create();
    expect(quizType).toBeInstanceOf(QuizType);
    expect(quizType.value).toBe(QuizTypeEnum.RANDOM);
  });

  it("should create a QuizType instance with value 'random'", () => {
    const quizType = QuizType.create('random');
    expect(quizType).toBeInstanceOf(QuizType);
    expect(quizType.value).toBe(QuizTypeEnum.RANDOM);
  });

  it("should create a QuizType instance with value 'learning'", () => {
    const quizType = QuizType.create('learning');
    expect(quizType).toBeInstanceOf(QuizType);
    expect(quizType.value).toBe(QuizTypeEnum.LEARNING);
  });

  it("should create a QuizType instance with value 'review'", () => {
    const quizType = QuizType.create('review');
    expect(quizType).toBeInstanceOf(QuizType);
    expect(quizType.value).toBe(QuizTypeEnum.REVIEW);
  });

  it("should create a QuizType instance with value 'check'", () => {
    const quizType = QuizType.create('check');
    expect(quizType).toBeInstanceOf(QuizType);
    expect(quizType.value).toBe(QuizTypeEnum.CHECK);
  });

  it("should create a QuizType instance with value 'unknown'", () => {
    const quizType = QuizType.create('unknown');
    expect(quizType).toBeInstanceOf(QuizType);
    expect(quizType.value).toBe(QuizTypeEnum.RANDOM);
  });
});
