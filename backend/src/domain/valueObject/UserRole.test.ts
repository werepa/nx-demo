import { RoleEnum } from '../../shared/enum';
import { UserRole } from './UserRole';

describe('UserRole', () => {
  describe('.create', () => {
    it('should create a UserRole instance with the provided lowercase value', () => {
      expect(UserRole.create('free').value).toBe(RoleEnum.FREE);
      expect(UserRole.create('member').value).toBe(RoleEnum.MEMBER);
      expect(UserRole.create('teacher').value).toBe(RoleEnum.TEACHER);
      expect(UserRole.create('administrator').value).toBe(RoleEnum.ADMIN);
      expect(UserRole.create('other').value).toBe(RoleEnum.FREE);
    });

    it('should default to Role.FREE if no value is provided', () => {
      expect(UserRole.create().value).toBe(RoleEnum.FREE);
    });

    it('should default to Role.FREE if an invalid value is provided', () => {
      expect(UserRole.create('unknown').value).toBe(RoleEnum.FREE);
    });
  });
});
