import { userMock } from "./userMock"

describe("UserMock", () => {
  it("should return an User", () => {
    let user = userMock()
    expect(user).toBeDefined()
    expect(user.id).toBeDefined()
    expect(user.name).toBeDefined()
    expect(user.email).toBeDefined()
    expect(user.password).toBeDefined()
    expect(user.createdAt).toBeDefined()
    expect(user.updatedAt).toBeDefined()
    expect(user.role).toBe("Free")

    user = userMock({ role: "Member" })
    expect(user).toBeDefined()
    expect(user.role).toBe("Member")
  })
})
