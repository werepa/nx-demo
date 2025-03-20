import bcrypt from "bcrypt"

export class UserPassword {
  private readonly _passwordHashed: string

  private constructor(password: string) {
    this._passwordHashed = password
  }

  public static create(password: string, hashed = false): UserPassword {
    if (!this.isValid(password)) {
      throw new Error("Password must be at least 6 characters long")
    }
    const salt = bcrypt.genSaltSync(10)
    const passwordHashed = hashed ? password : bcrypt.hashSync(password, salt)
    return new UserPassword(passwordHashed)
  }

  private static isValid(password: string): boolean {
    return password.length >= 6
  }

  public validate(password: string): boolean {
    return bcrypt.compareSync(password, this._passwordHashed)
  }

  public get value(): string {
    return this._passwordHashed
  }
}
