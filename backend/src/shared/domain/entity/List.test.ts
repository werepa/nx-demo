import { faker } from "@faker-js/faker"
import { List } from "./List"

describe("Domain => List", () => {
  let lista: List<any>

  beforeEach(() => {
    lista = new List([
      {
        id: "818b7ebc-0643-4bd7-8647-9f206b3b379d",
        name: "Tatame",
      },
      {
        id: "7c465726-e53e-48e1-8e53-726f42ec6500",
        name: "Área externa",
      },
      {
        id: "5ae0fe81-1b2d-4654-8c12-5e7ff9ff4649",
        name: "Auditório",
      },
      {
        id: "7521bf11-dc29-4d53-b1f0-09d47a2a1993",
        name: "Sala de Aula",
      },
    ])
  })

  test("should list items in order of names", () => {
    const sortedList = lista.getItems("name")
    expect(sortedList[0].name).toBe("Área externa")
    expect(sortedList[1].name).toBe("Auditório")
    expect(sortedList[2].name).toBe("Sala de Aula")
    expect(sortedList[3].name).toBe("Tatame")

    const emptyList = new List<any>([])
    expect(emptyList.getItems()).toEqual([])

    emptyList.add({
      id: "818b7ebc-0643-4bd7-8647-9f206b3b379d",
      name: "Tatame",
    })
    expect(emptyList.getItems()).toEqual([
      {
        id: "818b7ebc-0643-4bd7-8647-9f206b3b379d",
        name: "Tatame",
      },
    ])
  })

  test("should list items in order of IDs", () => {
    const idList = new List<any>([])
    lista.getItems().map((l) => idList.add({ id: l.id }))
    const sortedList = idList.getItems("id")
    expect(sortedList[0].id).toBe("5ae0fe81-1b2d-4654-8c12-5e7ff9ff4649")
    expect(sortedList[1].id).toBe("7521bf11-dc29-4d53-b1f0-09d47a2a1993")
    expect(sortedList[2].id).toBe("7c465726-e53e-48e1-8e53-726f42ec6500")
    expect(sortedList[3].id).toBe("818b7ebc-0643-4bd7-8647-9f206b3b379d")
  })

  test("should return the count of items in the list", () => {
    expect(lista.getCount()).toBe(4)
  })

  test("should add an item to the list", () => {
    lista.add({ id: faker.string.uuid(), name: faker.lorem.words(3) })
    expect(lista.getCount()).toBe(5)
  })

  test("should clear the list", () => {
    lista.clear()
    expect(lista.getCount()).toBe(0)
  })

  test("should remove an item from the list", () => {
    const item = { ...lista.getItems()[1] }
    expect(lista.exists(item)).toBe(true)
    lista.remove(item)
    expect(lista.exists(item)).toBe(false)
  })

  test("should update an item in the list", () => {
    const item = { ...lista.getItems()[1] }
    lista.update({ id: item.id, name: "Updated" })
    expect(lista.find(item.id).name).toBe("Updated")
  })

  test("should return an item by ID", () => {
    expect(lista.find(faker.string.uuid())).toBeNull()
    expect(lista.find(lista.getItems()[1].id)).toEqual(lista.getItems()[1])
  })

  test("should check if an item exists", () => {
    expect(lista.exists({ id: faker.string.uuid(), name: "Not in list" })).toBe(false)
    expect(lista.exists(lista.getItems()[1])).toBe(true)
  })

  test("should return a list of IDs", () => {
    const idList: any = []
    lista.getItems().map((l) => idList.push(l.id))
    expect(lista.listId()).toEqual(idList.sort())
  })
})
