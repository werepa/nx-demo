import { UserPassword } from './UserPassword';

describe('UserPassword', () => {
  it('should create a UserPassword instance with a hashed password', () => {
    const password = 'password123';
    const userPassword = UserPassword.create(password, true);
    expect(userPassword).toBeInstanceOf(UserPassword);
    expect(userPassword.value).toBe(password);
  });

  it('should create a UserPassword instance with a hashed password if not provided', () => {
    const password = 'password123';
    const userPassword = UserPassword.create(password);
    expect(userPassword).toBeInstanceOf(UserPassword);
    expect(userPassword.value).not.toBe(password);
  });

  it('should throw an error if the password is invalid', () => {
    const invalidPassword = '123';
    expect(() => UserPassword.create(invalidPassword)).toThrow(
      'Password must be at least 6 characters long'
    );
  });

  it('should validate a password', () => {
    const password = 'password123';
    const userPassword = UserPassword.create(password);
    expect(userPassword.validate(password)).toBe(true);
  });

  it('should return the hashed password value', () => {
    const password = 'password123';
    const userPassword = UserPassword.create(password);
    expect(userPassword.value).not.toBe(password);
  });
});
