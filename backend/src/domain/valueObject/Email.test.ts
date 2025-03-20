import { Email } from "./Email"

describe("Email ValueObject", () => {
  it("should create an instance of Email with a valid email", () => {
    const validEmail = "john.doe@example.com"
    const email = Email.create(validEmail)
    expect(email).toBeInstanceOf(Email)
    expect(email.value).toBe(validEmail)
  })

  it("should throw an error when creating an instance with an invalid email", () => {
    const invalidEmail = "invalid email"
    expect(() => Email.create(invalidEmail)).toThrow("Invalid email")
  })
})
