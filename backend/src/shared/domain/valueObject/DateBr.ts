import { WeekdayEnum } from "../../../shared/enum"

export class DateBr {
  private _data: Date

  private constructor(data: Date) {
    this._data = data
  }

  static create(data?: Date | DateBr | string) {
    if (!data) return new DateBr(new Date())
    if (typeof data === "string" && data.includes("/")) {
      const [dia, mes, ano] = data.split("/")
      return new DateBr(new Date(`${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}T00:00:00`))
    }
    if (typeof data === "string" && !data.toUpperCase().includes("T")) return new DateBr(new Date(`${data}T00:00:00`))
    if (typeof data === "string") return new DateBr(new Date(data))
    if (data instanceof DateBr) return new DateBr(data.value)
    return new DateBr(data as Date)
  }

  get formatoBr() {
    return this._data.toLocaleDateString("pt-BR")
  }

  get formatoISO() {
    return this._data.toISOString()
  }

  get formatoISO8601() {
    return this._data.toISOString().split("T")[0]
  }

  get weekday() {
    return WeekdayEnum[this._data.getDay()]
  }

  get weekdayExtenso() {
    const diasSemana = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"]
    return diasSemana[this._data.getDay()]
  }

  get value() {
    return this._data
  }

  getDate() {
    return this._data.getDate()
  }

  getMonth() {
    return this._data.getMonth()
  }

  getFullYear() {
    return this._data.getFullYear()
  }

  addDays(days: number) {
    const newDate = new Date(this._data)
    newDate.setDate(newDate.getDate() + days)
    this._data = newDate
    return this
  }

  subtractDays(days: number) {
    const newDate = new Date(this._data)
    newDate.setDate(newDate.getDate() - days)
    this._data = newDate
    return this
  }

  interval(date2: DateBr): number {
    const day_ms = 24 * 60 * 60 * 1000 // Número de milissegundos em um dia
    const diff_ms = date2.value.getTime() - this._data.getTime() // Diferença em milissegundos

    return Math.round(diff_ms / day_ms) // Converter para dias e arredondar
  }
}
