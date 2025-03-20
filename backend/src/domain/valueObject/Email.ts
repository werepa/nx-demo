export class Email {
  private constructor(private readonly _value: string) {}

  public static create(email: string): Email {
    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email")
    }
    return new Email(email)
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  public get value(): string {
    return this._value
  }
}
