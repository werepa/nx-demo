import { UserRepository } from '../../repository/UserRepository';
import { GetUserById } from './GetUserById';
import { DatabaseConnection } from '../../../infra/database/DatabaseConnection';
import { getTestDatabaseAdapter } from '../../../infra/database/TestDatabaseAdapter';
import { UserRepositoryDatabase } from '../../../infra/repository/UserRepositoryDatabase';
import { userMock } from '../../../tests/mocks';
import { faker } from '@faker-js/faker';

describe('GetUserById', () => {
  let connection: DatabaseConnection;
  let userRepository: UserRepository;
  let getUserById: GetUserById;

  beforeAll(() => {
    connection = getTestDatabaseAdapter();
    userRepository = new UserRepositoryDatabase(connection);
    getUserById = new GetUserById(userRepository);
  });

  beforeEach(async () => {
    await userRepository.clear();
  });

  afterAll(() => {
    connection.close();
  });

  it('should return the user when found', async () => {
    const user = userMock();
    await userRepository.save(user);
    const userSaved = await getUserById.execute(user.id);
    expect(userSaved).toEqual(user);
  });

  it('should return an error if the user does not exist!', async () => {
    const nonExistentUserId = faker.string.uuid();
    await expect(getUserById.execute(nonExistentUserId)).rejects.toThrow(
      `User ID:${nonExistentUserId} does not exist!`
    );
  });
});
