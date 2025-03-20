import { DatabaseConnection } from '../../../infra/database/DatabaseConnection';
import { getTestDatabaseAdapter } from '../../../infra/database/TestDatabaseAdapter';
import { GetUserByEmail } from './GetUserByEmail';
import { userMock } from '../../../tests/mocks';
import { DisciplineRepository } from '../../repository/DisciplineRepository';
import { UserRepository } from '../../repository/UserRepository';
import { DisciplineRepositoryDatabase } from '../../../infra/repository/DisciplineRepositoryDatabase';
import { UserRepositoryDatabase } from '../../../infra/repository/UserRepositoryDatabase';
import { SqliteInMemory } from '../../../infra/repository/inMemory/SqliteInMemory';

describe('GetUserByEmail', () => {
  let sqlite: SqliteInMemory;
  let connection: DatabaseConnection;
  let disciplineRepository: DisciplineRepository;
  let userRepository: UserRepository;
  let getUserByEmail: GetUserByEmail;

  beforeEach(async () => {
    sqlite = new SqliteInMemory();
    connection = getTestDatabaseAdapter();

    disciplineRepository = new DisciplineRepositoryDatabase(connection);
    await disciplineRepository.clear();

    userRepository = new UserRepositoryDatabase(connection);
    await userRepository.clear();

    getUserByEmail = new GetUserByEmail(userRepository);
  });

  afterEach(() => {
    connection.close();
  });

  it('should return the user when found by email', async () => {
    const user = userMock();
    await userRepository.save(user);
    const userSaved = await getUserByEmail.execute(user.email);
    expect(userSaved).toEqual(user);
  });

  it('should throw error when the user is not found by email', async () => {
    const email = 'any_email';
    await expect(getUserByEmail.execute(email)).rejects.toThrow(
      `User with email: "${email}" does not exist!`
    );
  });
});
