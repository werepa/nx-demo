import { WeekdayEnum } from "../../enum"
import { WeekdayList } from "./WeekdayList"

describe("WeekdayList", () => {
  it("should create an instance of WeekdayList with valid properties", () => {
    const weekdays = [WeekdayEnum.SEGUNDA, WeekdayEnum.TERCA, WeekdayEnum.QUARTA]
    const weekdayList = WeekdayList.create(weekdays)

    expect(weekdayList).toBeInstanceOf(WeekdayList)
    expect(weekdayList.getItems().map((item) => item.value)).toEqual(weekdays)
  })

  it("should return correct weekday names", () => {
    const weekdays = [WeekdayEnum.SEGUNDA, WeekdayEnum.TERCA]
    const weekdayList = WeekdayList.create(weekdays)

    expect(weekdayList.getItems().map((item) => item.name)).toEqual(["1", "2"])
  })

  it("should handle empty weekday list", () => {
    const weekdayList = WeekdayList.create([])
    expect(weekdayList.getItems()).toEqual([])
  })
})
