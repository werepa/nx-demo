import { DatabaseConnection } from '../../../infra/database/DatabaseConnection';
import { getTestDatabaseAdapter } from '../../../infra/database/TestDatabaseAdapter';
import { UserRepository } from '../../repository/UserRepository';
import { UserRepositoryDatabase } from '../../../infra/repository/UserRepositoryDatabase';
import { LogoutUser } from './LogoutUser';
import { CreateUser } from '../CreateUser/CreateUser';
import { SqliteInMemory } from '../../../infra/repository/inMemory';

describe('Usecase => LogoutUser', () => {
  let sqlite: SqliteInMemory;
  let connection: DatabaseConnection;
  let userRepository: UserRepository;
  let createUser: CreateUser;
  let logoutUser: LogoutUser;

  beforeEach(async () => {
    sqlite = new SqliteInMemory();
    connection = getTestDatabaseAdapter();

    userRepository = new UserRepositoryDatabase(connection);
    userRepository.clear();

    logoutUser = new LogoutUser(userRepository);
    createUser = new CreateUser(userRepository);
  });

  afterEach(() => {
    connection.close();
  });

  it('should throw an error if the token is invalid', async () => {
    const invalidToken = 'invalid_token';
    await userRepository.invalidateToken(invalidToken);
    await expect(logoutUser.execute(invalidToken)).rejects.toThrow(
      'Invalid token'
    );
  });
});
