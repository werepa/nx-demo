import { faker } from '@faker-js/faker';
import { CreateUser } from './CreateUser';
import { User } from '../../../domain/entity/User';
import { GetUsers } from '../GetUsers/GetUsers';
import { DatabaseConnection } from '../../../infra/database/DatabaseConnection';
import { getTestDatabaseAdapter } from '../../../infra/database/TestDatabaseAdapter';
import { UserRepository } from '../../repository/UserRepository';
import { UserRepositoryDatabase } from '../../../infra/repository/UserRepositoryDatabase';
import { GetUserById } from '../GetUserById/GetUserById';
import { userMock } from '../../../tests/mocks';

describe('Usecase => CreateUser', () => {
  let connection: DatabaseConnection;
  let userRepository: UserRepository;
  let createUser: CreateUser;
  let getUserById: GetUserById;
  let getUsers: GetUsers;

  beforeEach(async () => {
    connection = getTestDatabaseAdapter();

    userRepository = new UserRepositoryDatabase(connection);
    userRepository.clear();

    createUser = new CreateUser(userRepository);
    getUserById = new GetUserById(userRepository);
    getUsers = new GetUsers(userRepository);
  });

  afterEach(() => {
    connection.close();
  });

  test('should create an user in the repository', async () => {
    let user = userMock();
    let userSaved = await createUser.execute({
      ...user.toDTO(),
      password: faker.internet.password({ length: 8 }),
    });
    expect(userSaved).toBeInstanceOf(User);
    expect(userSaved.name).toBe(user.name);
    expect(userSaved.email).toBe(user.email);
    expect(userSaved.role).toBe(user.role);
    expect(userSaved.image).toBe(user.image);
    expect(userSaved.isActive).toBe(user.isActive);
    expect(await getUsers.execute()).toHaveLength(1);

    user = userMock();
    userSaved = await createUser.execute({
      ...user.toDTO(),
      name: null,
      password: faker.internet.password({ length: 8 }),
    });
    expect(userSaved).toBeInstanceOf(User);
    expect(userSaved.name).toBe(null);
    expect(userSaved.email).toBe(user.email);
  });

  test('should throw an error if email already exists', async () => {
    const user = userMock();
    const userSaved = await createUser.execute({
      ...user.toDTO(),
      password: faker.internet.password({ length: 8 }),
    });
    const userFound = await getUserById.execute(userSaved.userId);
    expect(userFound.email).toBe(user.email);
    await expect(
      createUser.execute({
        ...user.toDTO(),
        password: faker.internet.password({ length: 8 }),
      })
    ).rejects.toThrow(`Email ${user.email} already exists`);
  });
});
