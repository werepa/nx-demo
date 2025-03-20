import { DisciplineRepository } from '../../repository/DisciplineRepository';
import { GetDisciplines } from './GetDisciplines';
import { DatabaseConnection } from '../../../infra/database/DatabaseConnection';
import { getTestDatabaseAdapter } from '../../../infra/database/TestDatabaseAdapter';
import { DisciplineRepositoryDatabase } from '../../../infra/repository/DisciplineRepositoryDatabase';
import { disciplineMock } from '../../../tests/mocks/disciplineMock';

describe('Casos de Uso => GetDisciplines', () => {
  let connection: DatabaseConnection;
  let disciplineRepository: DisciplineRepository;
  let getDisciplines: GetDisciplines;

  beforeAll(() => {
    connection = getTestDatabaseAdapter();
    disciplineRepository = new DisciplineRepositoryDatabase(connection);
    getDisciplines = new GetDisciplines(disciplineRepository);
  });

  beforeEach(async () => {
    await disciplineRepository.clear();
  });

  afterAll(() => {
    connection.close();
  });

  test('should return an empty list if no disciplines exist', async () => {
    const disciplines = await getDisciplines.execute();
    expect(disciplines).toEqual([]);
  });

  test('should return a list of disciplines ordered by name', async () => {
    const discipline1 = disciplineMock({ name: 'Matemática' });
    const discipline2 = disciplineMock({ name: 'Português' });
    const discipline3 = disciplineMock({ name: 'Geografia' });
    const discipline4 = disciplineMock({ name: 'História' });

    discipline3.deactivate();

    await Promise.all([
      disciplineRepository.save(discipline1),
      disciplineRepository.save(discipline2),
      disciplineRepository.save(discipline3),
      disciplineRepository.save(discipline4),
    ]);

    const activeDisciplines = await getDisciplines.execute();
    expect(activeDisciplines).toHaveLength(3);
    expect(activeDisciplines[0]).toEqual(discipline4);
    expect(activeDisciplines[1]).toEqual(discipline1);
    expect(activeDisciplines[2]).toEqual(discipline2);

    const todasDisciplines = await getDisciplines.execute({ showAll: true });
    expect(todasDisciplines).toHaveLength(4);
    expect(todasDisciplines[0]).toEqual(discipline3);
    expect(todasDisciplines[1]).toEqual(discipline4);
    expect(todasDisciplines[2]).toEqual(discipline1);
    expect(todasDisciplines[3]).toEqual(discipline2);
  });

  test('should return a list of disciplines based on search criteria', async () => {
    const discipline1 = disciplineMock({ name: 'Matemática' });
    const discipline2 = disciplineMock({ name: 'Português' });
    const discipline3 = disciplineMock({ name: 'Geografia' });
    const discipline4 = disciplineMock({ name: 'História' });
    const discipline5 = disciplineMock({ name: 'Física' });
    const discipline6 = disciplineMock({ name: 'Química' });
    const discipline7 = disciplineMock({ name: 'Biologia' });
    const discipline8 = disciplineMock({ name: 'Inglês' });
    const discipline9 = disciplineMock({ name: 'Espanhol' });
    const discipline10 = disciplineMock({ name: 'Educação Física' });
    await Promise.all([
      disciplineRepository.save(discipline1),
      disciplineRepository.save(discipline2),
      disciplineRepository.save(discipline3),
      disciplineRepository.save(discipline4),
      disciplineRepository.save(discipline5),
      disciplineRepository.save(discipline6),
      disciplineRepository.save(discipline7),
      disciplineRepository.save(discipline8),
      disciplineRepository.save(discipline9),
      disciplineRepository.save(discipline10),
    ]);

    let disciplines = await getDisciplines.execute({ search: 'Português' });
    expect(disciplines).toHaveLength(1);
    expect(disciplines).toContainEqual(discipline2);

    disciplines = await getDisciplines.execute({ search: 'física' });
    expect(disciplines).toHaveLength(2);
    expect(disciplines).toContainEqual(discipline5);
    expect(disciplines).toContainEqual(discipline10);
  });
});
