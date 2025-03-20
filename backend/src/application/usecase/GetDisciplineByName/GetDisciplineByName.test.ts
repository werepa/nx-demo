import { Discipline } from '../../../domain/entity/Discipline';
import { GetDisciplineByName } from '..';
import { disciplineMock } from '../../../tests/mocks/disciplineMock';
import { DisciplineRepository } from '../../repository/DisciplineRepository';
import { DatabaseConnection } from '../../../infra/database/DatabaseConnection';
import { getTestDatabaseAdapter } from '../../../infra/database/TestDatabaseAdapter';
import { DisciplineRepositoryDatabase } from '../../../infra/repository/DisciplineRepositoryDatabase';

describe('GetDisciplineByName', () => {
  let connection: DatabaseConnection;
  let disciplineRepository: DisciplineRepository;
  let getDisciplineByName: GetDisciplineByName;

  beforeEach(() => {
    connection = getTestDatabaseAdapter();
    disciplineRepository = new DisciplineRepositoryDatabase(connection);
    getDisciplineByName = new GetDisciplineByName(disciplineRepository);
  });

  afterEach(() => {
    connection.close();
  });

  it('should return the discipline when it exists', async () => {
    const discipline: Discipline = disciplineMock();
    await disciplineRepository.save(discipline);
    const foundDiscipline = await getDisciplineByName.execute(discipline.name);
    expect(foundDiscipline).toEqual(discipline);
  });

  it('should throw an error when name is not provided', async () => {
    await expect(getDisciplineByName.execute('')).rejects.toThrow(
      'Discipline name is required'
    );
  });

  it('should throw an error when the discipline does not exist!', async () => {
    await expect(getDisciplineByName.execute('any_name')).rejects.toThrow(
      `Discipline: "any_name" does not exist!`
    );
  });
});
