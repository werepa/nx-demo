import { userMock } from '../../../tests/mocks';
import { DatabaseConnection } from '../../../infra/database/DatabaseConnection';
import { getTestDatabaseAdapter } from '../../../infra/database/TestDatabaseAdapter';
import { UserRepository } from '../../repository/UserRepository';
import { UserRepositoryDatabase } from '../../../infra/repository/UserRepositoryDatabase';
import { CredentialsDTO, LoginDTO, LoginUser } from './LoginUser';
import { CreateUser } from '../CreateUser/CreateUser';
import { SqliteInMemory } from '../../../infra/repository/inMemory';

describe('Usecase => LoginUser', () => {
  let sqlite: SqliteInMemory;
  let connection: DatabaseConnection;
  let userRepository: UserRepository;
  let createUser: CreateUser;
  let loginUser: LoginUser;

  beforeEach(async () => {
    sqlite = new SqliteInMemory();
    connection = getTestDatabaseAdapter();

    userRepository = new UserRepositoryDatabase(connection);
    userRepository.clear();

    loginUser = new LoginUser(userRepository);
    createUser = new CreateUser(userRepository);
  });

  afterEach(() => {
    connection.close();
  });

  test('should throw an error if email does not exist', async () => {
    const dto: CredentialsDTO = {
      email: 'test@example.com',
      password: 'password',
    };
    await expect(loginUser.execute(dto)).rejects.toThrow(
      'User with email test@example.com does not exist'
    );
  });

  it('should throw an error if password is invalid', async () => {
    const userDTO = userMock().toDTO();
    const user = await createUser.execute({
      ...userDTO,
      password: 'validPassword',
    });
    const dto: CredentialsDTO = {
      email: user.email,
      password: 'wrongpassword',
    };
    await expect(loginUser.execute(dto)).rejects.toThrow('Invalid password');
  });

  it('should return user and token if credentials are valid', async () => {
    const userDTO = userMock().toDTO();
    const user = await createUser.execute({
      ...userDTO,
      password: 'validPassword',
    });
    const dto: CredentialsDTO = {
      email: user.email,
      password: 'validPassword',
    };
    const result: LoginDTO = await loginUser.execute(dto);
    expect(result.user?.name).toBe(user.name);
    expect(result.user?.email).toBe(user.email);
    expect(result.token).toBeDefined();
  });
});
