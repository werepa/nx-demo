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
    this.items = this.items.filter((i: any) => i[this.idField] !== (item as any)[this.idField])
  }

  update(item: T) {
    if (!this.exists(item)) throw new Error("Este item não existe na coleção!")
    this.remove(item)
    this.items.push(item)
  }

  find(id: string): T | null {
    const item = this.items.find((i: any) => i[this.idField] === id)
    return item ?? null
  }

  exists(item: T): boolean {
    const existe = this.items.find((i: any) => i[this.idField] === (item as any)[this.idField])
    return existe ? true : false
  }

  listId(): string[] {
    return this.items.map((item: any) => item[this.idField]).sort()
  }

  listname(): string[] {
    const names = this.orderByName(this.items.map((item: any) => item["name"]))
    return names as string[]
  }

  toPersistence(): T[] {
    const lista: any[] = []
    this.items.map((item: any) => {
      lista.push(item.toPersistence())
    })
    return lista
  }

  toDTO(): any[] {
    const lista: any[] = []
    this.items.map((item: any) => {
      lista.push(item.toDTO())
    })
    return lista
  }

  private orderByName(items: T[]) {
    return [...items].sort((a: any, b: any) => {
      const name1 = this.replaceSpecialChars(a.name)
      const name2 = this.replaceSpecialChars(b.name)
      return name1.localeCompare(name2)
    })
  }

  private orderById(items: T[]) {
    return [...items].sort((a: any, b: any) => {
      const id1 = a[this.idField]
      const id2 = b[this.idField]
      return id1.localeCompare(id2)
    })
  }

  private replaceSpecialChars(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }
}
