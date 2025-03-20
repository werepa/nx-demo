import { RoleEnum } from "../../shared/enum"

export class UserRole {
  private readonly _value: RoleEnum

  private constructor(value: string) {
    switch (value.toLowerCase()) {
      case "free":
        this._value = RoleEnum.FREE
        break
      case "member":
        this._value = RoleEnum.MEMBER
        break
      case "teacher":
        this._value = RoleEnum.TEACHER
        break
      case "admin":
      case "administrator":
        this._value = RoleEnum.ADMIN
        break
      default:
        this._value = RoleEnum.FREE
    }
  }

  static create(value: string = "free"): UserRole {
    return new UserRole(value)
  }

  get value(): RoleEnum {
    return this._value
  }
}
