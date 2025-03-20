import { WeekdayEnum } from "../../../shared/enum"
import { List } from "./List"

class WeekdayItem {
  constructor(public readonly value: WeekdayEnum) {}
  [key: string]: unknown
  toDTO?: () => unknown
  toPersistence?: () => unknown

  get id(): string {
    return this.value.toString()
  }

  get name(): string {
    return this.value.toString()
  }
}

export class WeekdayList extends List<WeekdayItem> {
  private constructor(weekdays: WeekdayEnum[]) {
    super()
    weekdays.forEach((day) => this.add(new WeekdayItem(day)))
  }

  static create(weekdays: WeekdayEnum[]) {
    return new WeekdayList(weekdays)
  }
}
