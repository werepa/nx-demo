import { ValueObject } from "./ValueObject"

class ConcreteValueObject extends ValueObject<any> {
  constructor(props: any) {
    super(props)
  }
}

describe("ValueObject", () => {
  describe(".equals", () => {
    it("should return true when comparing two equal ValueObjects", () => {
      const props = { id: 1, name: "John Doe" }
      const vo1 = new ConcreteValueObject(props)
      const vo2 = new ConcreteValueObject(props)
      expect(vo1.equals(vo2)).toBe(true)
    })

    it("should return false when comparing with null or undefined", () => {
      const props = { id: 1, name: "John Doe" }
      const vo = new ConcreteValueObject(props)
      //@ts-ignore
      expect(vo.equals(null)).toBe(false)
      expect(vo.equals(undefined)).toBe(false)
    })

    it("should return false when comparing with a ValueObject with undefined props", () => {
      const props = { id: 1, name: "John Doe" }
      const vo1 = new ConcreteValueObject(props)
      const vo2 = new ConcreteValueObject({})
      expect(vo1.equals(vo2)).toBe(false)
    })

    it("should return false when comparing two different ValueObjects", () => {
      const props1 = { id: 1, name: "John Doe" }
      const props2 = { id: 2, name: "Jane Smith" }
      const vo1 = new ConcreteValueObject(props1)
      const vo2 = new ConcreteValueObject(props2)
      const vo3 = new ConcreteValueObject(undefined)
      expect(vo1.equals(vo2)).toBe(false)
      expect(vo1.equals(vo3)).toBe(false)
      expect(vo1.equals()).toBe(false)
    })
  })
})
