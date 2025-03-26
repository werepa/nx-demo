/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity } from "./Entity"

export class List<T> {
  public items: T[]
  private idField = ""

  constructor(items?: T[], idField = "id") {
    this.items = items ?? []
    this.idField = idField
  }

  getItems(orderField?: string) {
    if (orderField === "name") return this.orderByName(this.items)
    if (orderField === this.idField) return this.orderById(this.items)
    return this.items
  }

  getCount() {
    return this.items.length
  }

  add(item: T) {
    if (this.exists(item)) throw new Error("Este item já existe na coleção!")
    this.items.push(item)
  }

  clear() {
    this.items = []
  }

  remove(item: T) {
    this.items = this.items.filter((i: T) => i[this.idField] !== (item as T)[this.idField])
  }

  update(item: T) {
    if (!this.exists(item)) throw new Error("Este item não existe na coleção!")
    this.remove(item)
    this.items.push(item)
  }

  find(id: string): T | null {
    const item = this.items.find((i: T) => i[this.idField] === id)
    return item ?? null
  }

  exists(item: T): boolean {
    const existe = this.items.find((i: T) => i[this.idField] === (item as T)[this.idField])
    return existe ? true : false
  }

  listId(): string[] {
    return this.items.map((item: T) => item[this.idField]).sort()
  }

  listname(): string[] {
    const names = this.orderByName(this.items.map((item: T) => item["name"]))
    return names as string[]
  }

  // toPersistence(): T[] {
  //   const lista: T[] = []
  //   this.items.map((item: T) => {
  //     lista.push((item as Entity<T>).toPersistence())
  //   })
  //   return lista
  // }

  toDTO(): any[] {
    const lista: T[] = []
    this.items.map((item: T) => {
      lista.push((item as any).toDTO())
    })
    return lista
  }

  private orderByName(items: T[]) {
    return [...items].sort((a: T, b: T) => {
      const name1 = this.replaceSpecialChars((a as any).name)
      const name2 = this.replaceSpecialChars((b as any).name)
      return name1.localeCompare(name2)
    })
  }

  private orderById(items: T[]) {
    return [...items].sort((a: T, b: T) => {
      const id1 = a[this.idField]
      const id2 = b[this.idField]
      return id1.localeCompare(id2)
    })
  }

  private replaceSpecialChars(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }
}
