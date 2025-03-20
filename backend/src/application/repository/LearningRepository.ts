import { Discipline } from '../../domain/entity/Discipline';
import { TopicLearning } from '../../domain/entity/TopicLearning';
import { User } from '../../domain/entity/User';
import { Learning } from '../../domain/entity/Learning';

export interface LearningRepository {
  getDisciplineLearning(user: User, discipline: Discipline): Promise<Learning>;
  save(learning: Learning): Promise<void>;
  clear(): Promise<void>;
}
