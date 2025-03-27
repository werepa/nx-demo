import { DisciplineRepository } from "../../application/repository"
import { Discipline, Topic } from "../../domain/entity"
import { DateBr } from "../../shared/domain/valueObject"
import { DisciplineState, TopicState } from "../../shared/models"
import { DatabaseConnection } from "../database"

interface RawDisciplineData {
  discipline_id: string
  name: string
  image: string
  is_active: number | boolean
  created_at: string
  updated_at: string | null
}

interface RawTopicData {
  topic_id: string
  discipline_id: string
  name: string
  is_classify: number | boolean
  parent_id: string | null
  topic_root_id: string
  dependencies: string
  obs: string | null
  is_active: number | boolean
  created_at: string
  updated_at: string | null
}

export class DisciplineRepositoryDatabase implements DisciplineRepository {
  constructor(private readonly connection: DatabaseConnection) {}

  async save(discipline: Discipline): Promise<void> {
    const existingDiscipline = await this.getById(discipline.disciplineId)
    if (existingDiscipline) {
      await this.updateDiscipline(discipline)
    } else {
      await this.insertDiscipline(discipline)
    }
    const topicsRoot = discipline.topics.getItems().filter((topic: Topic) => topic.isRoot())
    const topicsNotRoot = discipline.topics.getItems().filter((topic: Topic) => !topic.isRoot())
    if (topicsRoot.length > 0) await this.saveTopics(topicsRoot)
    if (topicsNotRoot.length > 0) await this.saveTopics(topicsNotRoot)
  }

  async getById(disciplineId: string): Promise<Discipline | null> {
    const disciplineFromSqlite = await this.fetchDisciplineById(disciplineId)
    if (!disciplineFromSqlite) return null

    const topicsFromSqlite = await this.fetchTopicsByDisciplineId(disciplineFromSqlite.discipline_id)
    const disciplineState = this.convertDatabaseDiscipline(disciplineFromSqlite, topicsFromSqlite)
    return Discipline.toDomain(disciplineState)
  }

  async getByName(name: string): Promise<Discipline | null> {
    const disciplineFromSqlite = await this.fetchDisciplineByName(name)
    if (!disciplineFromSqlite) return null

    const topicsFromSqlite = await this.fetchTopicsByDisciplineId(disciplineFromSqlite.discipline_id)
    const disciplineState = this.convertDatabaseDiscipline(disciplineFromSqlite, topicsFromSqlite)
    return Discipline.toDomain(disciplineState)
  }

  async getAll(
    { search, showAll }: { search?: string; showAll: boolean } = {
      search: null,
      showAll: false,
    }
  ): Promise<Discipline[]> {
    const queryDisciplineParts = [`SELECT * FROM disciplines WHERE ${this.dbType(1)}`]
    if (!showAll) queryDisciplineParts.push(`AND is_active = ${this.dbType(1)}`)
    if (search) {
      if (this.connection.databaseType() === "postgres") {
        queryDisciplineParts.push("AND name ILIKE $1")
      } else {
        queryDisciplineParts.push("AND LOWER(name) LIKE ?")
      }
    }
    queryDisciplineParts.push("ORDER BY name")
    const queryDiscipline = queryDisciplineParts.join(" ")

    const disciplinesFromSqlite = search?.trim()
      ? await this.connection.all(queryDiscipline, [`%${search?.trim().toLowerCase()}%`])
      : await this.connection.all(queryDiscipline)

    const disciplinesState: DisciplineState[] = await Promise.all(
      disciplinesFromSqlite.map(async (rawDisciplineData: RawDisciplineData) => {
        const topicsFromSqlite = await this.fetchTopicsByDisciplineId(rawDisciplineData.discipline_id)
        return this.convertDatabaseDiscipline(rawDisciplineData, topicsFromSqlite)
      })
    )

    return disciplinesState.map((disciplineState: DisciplineState) => Discipline.toDomain(disciplineState))
  }

  async delete(disciplineId: string): Promise<void> {
    return this.connection.run(
      `UPDATE disciplines SET is_active = ${this.dbType(0)}, updated_at=? WHERE discipline_id = ?`,
      [DateBr.create().formatoISO, disciplineId]
    )
  }

  private async updateDiscipline(discipline: Discipline): Promise<void> {
    const query =
      "UPDATE disciplines SET name = ?, image = ?, is_active = ?, created_at = ?, updated_at = ? WHERE discipline_id = ?"
    const params = [
      discipline.name,
      discipline.image,
      discipline.isActive ? this.dbType(1) : this.dbType(0),
      discipline.createdAt ? discipline.createdAt.value.toISOString() : null,
      discipline.updatedAt ? discipline.updatedAt.value.toISOString() : DateBr.create().value.toISOString(),
      discipline.disciplineId,
    ]
    await this.connection.run(query, params)
  }

  private async insertDiscipline(discipline: Discipline): Promise<void> {
    const query =
      "INSERT INTO disciplines (discipline_id, name, image, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    const params = [
      discipline.disciplineId,
      discipline.name,
      discipline.image,
      discipline.isActive ? this.dbType(1) : this.dbType(0),
      discipline.createdAt ? discipline.createdAt.value.toISOString() : DateBr.create().value.toISOString(),
      null,
    ]
    await this.connection.run(query, params)
  }

  private async saveTopics(topics: Topic[]): Promise<void> {
    for (const topic of topics) {
      await this.insertOrUpdateTopic(topic)
    }
  }

  private async insertOrUpdateTopic(topic: Topic): Promise<void> {
    const query =
      "INSERT INTO topics (topic_id, topic_root_id, discipline_id, name, is_classify, parent_id, dependencies, obs, is_active, created_at, updated_at) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(topic_id) DO UPDATE SET topic_root_id = excluded.topic_root_id, name = excluded.name, is_classify = excluded.is_classify, parent_id = excluded.parent_id, dependencies = excluded.dependencies, obs = excluded.obs, is_active = excluded.is_active, updated_at = excluded.updated_at"
    const params = [
      topic.topicId,
      topic.topicRootId,
      topic.disciplineId,
      topic.name,
      topic.isTopicClassify ? this.dbType(1) : this.dbType(0),
      topic.topicParentId,
      JSON.stringify(topic.dependencies),
      topic.obs,
      topic.isActive ? this.dbType(1) : this.dbType(0),
      topic.createdAt ? topic.createdAt.value.toISOString() : DateBr.create().value.toISOString(),
      topic.updatedAt ? topic.updatedAt.value.toISOString() : null,
    ]
    await this.connection.run(query, params)
  }

  private fetchDisciplineById(disciplineId: string): Promise<RawDisciplineData | null> {
    const query = "SELECT * FROM disciplines WHERE discipline_id = ?"
    return this.connection.get(query, [disciplineId])
  }

  private fetchTopicsByDisciplineId(disciplineId: string): Promise<RawTopicData[]> {
    const query = "SELECT * FROM topics WHERE discipline_id = ? ORDER BY name"
    return this.connection.all(query, [disciplineId])
  }

  private fetchDisciplineByName(name: string): Promise<RawDisciplineData | null> {
    const queryDisciplineParts = [`SELECT * FROM disciplines WHERE ${this.dbType(1)}`]
    if (this.connection.databaseType() === "postgres") {
      queryDisciplineParts.push("AND name ILIKE ?")
    } else {
      queryDisciplineParts.push("AND LOWER(name) LIKE ?")
    }
    const query = queryDisciplineParts.join(" ")
    return this.connection.get(query, [`%${name?.trim().toLowerCase()}%`])
  }

  private convertDatabaseDiscipline(rawDisciplineData: RawDisciplineData, rawTopicsData: RawTopicData[]): DisciplineState {
    const disciplineState: DisciplineState = {
      disciplineId: rawDisciplineData.discipline_id,
      name: rawDisciplineData.name,
      topics: [],
      image: rawDisciplineData.image,
      isActive: !!rawDisciplineData.is_active,
      createdAt: DateBr.create(rawDisciplineData.created_at).value,
      updatedAt: rawDisciplineData.updated_at ? DateBr.create(rawDisciplineData.updated_at).value : null,
    }
    rawTopicsData.map((topic: RawTopicData) => {
      const topicState: TopicState = {
        topicId: topic.topic_id,
        disciplineId: topic.discipline_id,
        name: topic.name,
        isTopicClassify: !!topic.is_classify,
        topicParentId: topic.parent_id,
        topicRootId: topic.topic_id,
        depth: 1,
        dependencies: JSON.parse(topic.dependencies),
        obs: topic.obs,
        isActive: !!topic.is_active,
        createdAt: DateBr.create(topic.created_at).value,
        updatedAt: topic.updated_at ? DateBr.create(topic.updated_at).value : null,
      }
      disciplineState.topics.push(topicState)
    })
    return disciplineState
  }

  private dbType(value: number): boolean | number {
    return this.connection.databaseType() === "postgres" ? Boolean(value) : value
  }
}
