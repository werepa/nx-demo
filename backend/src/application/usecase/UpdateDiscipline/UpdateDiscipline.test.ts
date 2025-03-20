import { DisciplineRepository } from '../../repository/DisciplineRepository';
import { Discipline } from '../../../domain/entity/Discipline';
import { UpdateDiscipline } from './UpdateDiscipline';
import {
  disciplineFromPersistence,
  disciplineMock,
} from '../../../tests/mocks/disciplineMock';
import { DatabaseConnection } from '../../../infra/database/DatabaseConnection';
import { getTestDatabaseAdapter } from '../../../infra/database/TestDatabaseAdapter';
import { DisciplineRepositoryDatabase } from '../../../infra/repository/DisciplineRepositoryDatabase';
import { SqliteInMemory } from '../../../infra/repository/inMemory/SqliteInMemory';

describe('UpdateDiscipline', () => {
  let sqlite: SqliteInMemory;
  let connection: DatabaseConnection;
  let disciplineRepository: DisciplineRepository;
  let updateDiscipline: UpdateDiscipline;

  beforeAll(() => {
    sqlite = new SqliteInMemory();
    connection = getTestDatabaseAdapter();
    disciplineRepository = new DisciplineRepositoryDatabase(connection);
    updateDiscipline = new UpdateDiscipline(disciplineRepository);
  });

  afterAll(() => {
    connection.close();
  });

  it('should successfully update a discipline', async () => {
    const discipline: Discipline = disciplineMock();
    await disciplineRepository.save(discipline);
    discipline.updateName('updated name');
    const disciplineUpdated = await updateDiscipline.execute(
      disciplineFromPersistence(discipline)
    );
    expect(disciplineUpdated).toBeInstanceOf(Discipline);
    expect(disciplineUpdated?.name).toBe('updated name');
    expect(disciplineUpdated?.createdAt).toEqual(discipline.createdAt);
    expect(disciplineUpdated?.updatedAt).not.toEqual(discipline.createdAt);
  });

  it('should throw an error if the discipline does not exist!', async () => {
    const discipline: Discipline = disciplineMock();
    await expect(
      updateDiscipline.execute(disciplineFromPersistence(discipline))
    ).rejects.toThrow(`Discipline ID:"${discipline.id}" does not exist!`);
  });

  it('should throw an error if the discipline does not have a name', async () => {
    const discipline: Discipline = disciplineMock();
    discipline.updateName('');
    await expect(
      updateDiscipline.execute(disciplineFromPersistence(discipline))
    ).rejects.toThrow('Missing required properties');
  });

  it('should throw an error if the name already exists in another discipline', async () => {
    const discipline1: Discipline = disciplineMock();
    const discipline2: Discipline = disciplineMock();
    await disciplineRepository.save(discipline1);
    await disciplineRepository.save(discipline2);
    discipline2.updateName(discipline1.name);
    await expect(
      updateDiscipline.execute(disciplineFromPersistence(discipline2))
    ).rejects.toThrow(`Discipline: "${discipline1.name}" already exists!`);
  });
});
