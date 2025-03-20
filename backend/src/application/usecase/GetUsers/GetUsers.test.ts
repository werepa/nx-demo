import { User } from '../../../domain/entity/User';
import { userMock } from '../../../tests/mocks';
import { GetUsers } from '..';
import { DatabaseConnection } from '../../../infra/database/DatabaseConnection';
import { getTestDatabaseAdapter } from '../../../infra/database/TestDatabaseAdapter';
import { UserRepository } from '../../repository/UserRepository';
import { UserRepositoryDatabase } from '../../../infra/repository/UserRepositoryDatabase';
import { SqliteInMemory } from '../../../infra/repository/inMemory';

describe('GetUsers', () => {
  let sqlite: SqliteInMemory;
  let connection: DatabaseConnection;
  let userRepository: UserRepository;
  let getUsers: GetUsers;

  beforeEach(async () => {
    sqlite = new SqliteInMemory();
    connection = getTestDatabaseAdapter();

    userRepository = new UserRepositoryDatabase(connection);
    await userRepository.clear();

    getUsers = new GetUsers(userRepository);
  });

  afterEach(() => {
    connection.close();
  });

  it('should return all users order by name', async () => {
    const users: User[] = [
      userMock({ name: 'User 2' }),
      userMock({ name: 'User 3' }),
      userMock({ name: 'User 1' }),
      userMock({ name: 'User 4' }),
    ];
    users[3].deactivate();
    const activeUsers = users
      .filter((u) => u.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
    const allUsers = users.sort((a, b) => a.name.localeCompare(b.name));
    await Promise.all(users.map((user) => userRepository.save(user)));
    const result1 = await getUsers.execute();
    expect(result1).toHaveLength(3);
    expect(result1).toEqual(activeUsers);
    const result2 = await getUsers.execute({ showAll: true });
    expect(result2).toHaveLength(4);
    expect(result2).toEqual(allUsers);
  });

  it('should return an empty list when there are no users', async () => {
    const result = await getUsers.execute();
    expect(result).toEqual([]);
  });
});
