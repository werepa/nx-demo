import { DateBr } from "./DateBr"

describe("ValueObjects => DateBr", () => {
  test("should create a DateBr instance using Date", () => {
    const data = DateBr.create()
    expect(data).toBeDefined()
    expect(data).toBeInstanceOf(DateBr)
    expect(DateBr.create(data)).toBeInstanceOf(DateBr)
  })

  test("should create a DateBr instance using long ISO string", () => {
    const data = DateBr.create("2023-01-07T00:00:00")
    expect(data).toBeDefined()
    expect(data instanceof DateBr).toBe(true)
    expect(data.getDate()).toBe(7)
    expect(data.getMonth()).toBe(0)
    expect(data.getFullYear()).toBe(2023)
  })

  test("should create a DateBr instance using short ISO string", () => {
    const data = DateBr.create("2023-01-07")
    expect(data).toBeDefined()
    expect(data instanceof DateBr).toBe(true)
    expect(data.getDate()).toBe(7)
    expect(data.getMonth()).toBe(0)
    expect(data.getFullYear()).toBe(2023)
  })

  test("should create a DateBr instance using BR string", () => {
    const data = DateBr.create("07/01/2023")
    expect(data).toBeDefined()
    expect(data instanceof DateBr).toBe(true)
    expect(data.getDate()).toBe(7)
    expect(data.getMonth()).toBe(0)
    expect(data.getFullYear()).toBe(2023)
  })

  test("should return the date in BR format", () => {
    const data = DateBr.create("2023-01-07T00:00:00")
    expect(data.formatoBr).toBe("07/01/2023")
    const data2 = DateBr.create("2023-07-14T10:00:00")
    expect(data2.formatoBr).toBe("14/07/2023")
  })

  test("should return the date in ISO format", () => {
    const data = DateBr.create("2023-01-07T03:12:34.000Z")
    expect(data.formatoISO).toBe("2023-01-07T03:12:34.000Z")
  })

  test("should return the date in ISO8601 format", () => {
    const data = DateBr.create("2023-01-07T00:00:00")
    expect(data.formatoISO8601).toBe("2023-01-07")
  })

  test("should add n days to the date", () => {
    const data1 = DateBr.create("2023-01-07T09:55:00")
    const data2 = DateBr.create("2023-01-07T09:56:00")
    data1.addDays(3)
    data2.addDays(3)
    expect(data1.formatoBr).toBe("10/01/2023")
    expect(data1.value.getHours()).toBe(9)
    expect(data1.value.getMinutes()).toBe(55)
    expect(data2.value.getHours()).toBe(9)
    expect(data2.value.getMinutes()).toBe(56)
    expect(data2.value > data1.value).toBe(true)
  })

  test("should calculate the interval of days between dates", () => {
    const data = DateBr.create("2023-01-07T00:00:00")
    expect(data.formatoBr).toBe("07/01/2023")

    expect(data.interval(data)).toBe(0)
    expect(data.interval(DateBr.create("2023-01-08"))).toBe(1)
    expect(data.interval(DateBr.create("2023-01-10"))).toBe(3)
    expect(data.interval(DateBr.create("2023-01-01"))).toBe(-6)
  })

  test("should return the weekday", () => {
    const data = DateBr.create("2023-01-07T00:00:00")
    expect(data.weekday).toBe("SABADO")
    expect(data.weekdayExtenso).toBe("Sábado")
  })
})
