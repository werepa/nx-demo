import { disciplineMock, topicMock } from "../../tests/mocks/disciplineMock"
import { DisciplineRepository } from "../../application/repository/DisciplineRepository"
import { DisciplineRepositoryDatabase } from "./DisciplineRepositoryDatabase"
import { DatabaseConnection, getTestDatabaseAdapter } from "../database"
import { faker } from "@faker-js/faker"

describe("DisciplineRepositoryDatabase", () => {
  let connection: DatabaseConnection
  let disciplineRepository: DisciplineRepository

  beforeAll(async () => {
    connection = getTestDatabaseAdapter()
    disciplineRepository = new DisciplineRepositoryDatabase(connection)
  })

  beforeEach(async () => {
    await connection.clear(["topics", "disciplines"])
  })

  afterAll(async () => {
    await connection.close()
  })

  describe("Discipline", () => {
    test("should save a discipline", async () => {
      const discipline = disciplineMock()
      const topic1 = topicMock({ name: "topic 1" })
      const topic2 = topicMock({ name: "topic 2" })
      const topic3 = topicMock({ name: "topic 3" })
      discipline.topics.add(topic1)
      discipline.topics.add(topic2)
      discipline.topics.add(topic3)
      discipline.setTopicParent({ topic: topic2, topicParent: topic1 })
      expect(discipline.topics.getItems()).toHaveLength(3)
      discipline.topic({ topicId: topic3.topicId })?.deactivate()
      await disciplineRepository.save(discipline)
      const savedDisciplines = await disciplineRepository.getAll({
        showAll: true,
      })
      expect(savedDisciplines).toHaveLength(1)
      expect(savedDisciplines[0].topics.getItems()).toHaveLength(3)
      savedDisciplines[0].topics.getItems()[0].setChanged(topic1.updatedAt.value)
      savedDisciplines[0].topics.getItems()[1].setChanged(topic2.updatedAt.value)
      savedDisciplines[0].topics.getItems()[2].setChanged(topic3.updatedAt.value)
      expect(savedDisciplines[0].topics.getItems()).toEqual([topic1, topic2, topic3])
      expect(savedDisciplines[0]).toEqual(discipline)
    })

    test("should update an existing discipline", async () => {
      const discipline = disciplineMock()
      const topic1 = topicMock({ name: "topic 1" })
      const topic2 = topicMock({ name: "topic 2" })
      const topic3 = topicMock({ name: "topic 3" })
      expect(discipline.updatedAt).toBeNull()
      expect(topic1.updatedAt).toBeNull()
      discipline.topics.add(topic1)
      discipline.topics.add(topic2)
      discipline.topics.add(topic3)
      expect(topic1.updatedAt).not.toBeNull()
      expect(discipline.updatedAt).toBeNull()
      discipline.setTopicParent({ topic: topic2, topicParent: topic1 })
      discipline.topic({ topicId: topic3.topicId })?.deactivate()
      expect(discipline.updatedAt).toBeNull()
      await disciplineRepository.save(discipline)
      discipline.updateName("name changed")
      discipline.topic({ topicId: topic2.topicId })?.updateName("topic 2 changed")
      await disciplineRepository.save(discipline)
      const savedDisciplines = await disciplineRepository.getAll()
      expect(savedDisciplines).toHaveLength(1)
      expect(savedDisciplines[0].disciplineId).toBe(discipline.disciplineId)
      expect(savedDisciplines[0].name).toBe("name changed")
      expect(savedDisciplines[0].topics.getItems()).toHaveLength(3)
      expect(savedDisciplines[0].topic({ topicId: topic2.topicId })?.name).toBe("topic 2 changed")
      expect(savedDisciplines[0].createdAt).toEqual(discipline.createdAt)
      expect(savedDisciplines[0].updatedAt).not.toBeNull()
    })

    test("should get a discipline by ID", async () => {
      const discipline = disciplineMock()
      await disciplineRepository.save(discipline)
      const savedDiscipline = await disciplineRepository.getById(discipline.disciplineId)
      expect(savedDiscipline).toEqual(discipline)
    })

    test("should get a discipline by name", async () => {
      const discipline = disciplineMock({ name: "Português" })
      await disciplineRepository.save(discipline)
      let savedDiscipline = await disciplineRepository.getByName("Português")
      expect(savedDiscipline).toEqual(discipline)
      savedDiscipline = await disciplineRepository.getByName("português")
      expect(savedDiscipline).toEqual(discipline)
      savedDiscipline = await disciplineRepository.getByName("tug")
      expect(savedDiscipline).toEqual(discipline)
    })

    test("should return null if discipline does not exist!", async () => {
      const discipline = await disciplineRepository.getById(faker.string.uuid())
      expect(discipline).toBeNull()
    })

    test("should return all disciplines", async () => {
      const discipline1 = disciplineMock({ name: "Discipline 1" })
      const discipline2 = disciplineMock({ name: "Discipline 2" })
      await disciplineRepository.save(discipline1)
      await disciplineRepository.save(discipline2)
      const savedDisciplines = await disciplineRepository.getAll()
      expect(savedDisciplines).toHaveLength(2)
      expect(savedDisciplines).toEqual([discipline1, discipline2])
    })

    // create a test to get all disciplines with showAll = true
    test("should return all disciplines with showAll = true", async () => {
      const discipline1 = disciplineMock({ name: "Discipline 1" })
      const discipline2 = disciplineMock({ name: "Discipline 2" })
      const discipline3 = disciplineMock({ name: "Discipline 3" })
      discipline3.deactivate()
      await disciplineRepository.save(discipline1)
      await disciplineRepository.save(discipline2)
      await disciplineRepository.save(discipline3)
      const savedDisciplines = await disciplineRepository.getAll({
        showAll: true,
      })
      expect(savedDisciplines).toHaveLength(3)
      expect(savedDisciplines).toEqual([discipline1, discipline2, discipline3])
      expect(savedDisciplines[0].isActive).toBe(true)
      expect(savedDisciplines[1].isActive).toBe(true)
      expect(savedDisciplines[2].isActive).toBe(false)
    })

    test("should return all disciplines with showAll = false", async () => {
      const discipline1 = disciplineMock({ name: "Discipline 1" })
      const discipline2 = disciplineMock({ name: "Discipline 2" })
      const discipline3 = disciplineMock({ name: "Discipline 3" })
      discipline3.deactivate()
      await disciplineRepository.save(discipline1)
      await disciplineRepository.save(discipline2)
      await disciplineRepository.save(discipline3)
      const savedDisciplines = await disciplineRepository.getAll({
        showAll: false,
      })
      expect(savedDisciplines).toHaveLength(2)
      expect(savedDisciplines).toEqual([discipline1, discipline2])
      expect(savedDisciplines[0].isActive).toBe(true)
      expect(savedDisciplines[1].isActive).toBe(true)
      expect(savedDisciplines[0].disciplineId).toBe(discipline1.disciplineId)
      expect(savedDisciplines[1].disciplineId).toBe(discipline2.disciplineId)
    })

    test("should return an empty array if no disciplines exist", async () => {
      const savedDisciplines = await disciplineRepository.getAll()
      expect(savedDisciplines).toHaveLength(0)
    })

    test("should return an empty array if no disciplines exist with showAll = true", async () => {
      const savedDisciplines = await disciplineRepository.getAll({
        showAll: true,
      })
      expect(savedDisciplines).toHaveLength(0)
    })

    test("should return an empty array if no disciplines exist with showAll = false", async () => {
      const savedDisciplines = await disciplineRepository.getAll({
        showAll: false,
      })
      expect(savedDisciplines).toHaveLength(0)
    })
  })
})
