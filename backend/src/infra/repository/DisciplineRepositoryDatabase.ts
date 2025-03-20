import { DisciplineRepository } from "../../application/repository"
import { Discipline, Topic } from "../../domain/entity"
import { DateBr } from "../../shared/domain/valueObject"
import { DisciplineState, TopicState } from "../../shared/models"
import { DatabaseConnection } from "../database"

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
    const queryDisciplineParts = [`SELECT * FROM discipline WHERE ${this.dbType(1)}`]
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
      ? await this.connection.all(queryDiscipline, `%${search?.trim().toLowerCase()}%`)
      : await this.connection.all(queryDiscipline)

    const disciplinesState: DisciplineState[] = await Promise.all(
      disciplinesFromSqlite.map(async (disciplineFromSqlite: any) => {
        const topicsFromSqlite = await this.fetchTopicsByDisciplineId(disciplineFromSqlite.discipline_id)
        return this.convertDatabaseDiscipline(disciplineFromSqlite, topicsFromSqlite)
      })
    )

    return disciplinesState.map((disciplineState: DisciplineState) => Discipline.toDomain(disciplineState))
  }

  async delete(disciplineId: string): Promise<void> {
    return this.connection.run(`UPDATE discipline SET is_active = ${this.dbType(0)}, updated_at=? WHERE discipline_id = ?`, [
      DateBr.create().formatoISO,
      disciplineId,
    ])
  }

  async clear(): Promise<void> {
    if (process.env["NODE_ENV"] === "production") return

    if (this.connection.databaseType() === "postgres") {
      const tables = ["topic", "discipline"]
      const truncateQuery = `TRUNCATE TABLE ${tables.map((table) => `public.${table}`).join(", ")} CASCADE`
      await this.connection.run(truncateQuery)
    } else {
      await this.connection.run("DELETE FROM topic")
      await this.connection.run("DELETE FROM discipline")
    }
  }

  private async updateDiscipline(discipline: Discipline): Promise<void> {
    const query =
      "UPDATE discipline SET name = ?, image = ?, is_active = ?, created_at = ?, updated_at = ? WHERE discipline_id = ?"
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
      "INSERT INTO discipline (discipline_id, name, image, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
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
      "INSERT INTO topic (topic_id, topic_root_id, discipline_id, name, is_classify, parent_id, dependencies, obs, is_active, created_at, updated_at) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
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

  private async fetchDisciplineById(disciplineId: string): Promise<any> {
    const query = "SELECT * FROM discipline WHERE discipline_id = ?"
    return this.connection.get(query, disciplineId)
  }

  private async fetchTopicsByDisciplineId(disciplineId: string): Promise<any[]> {
    const query = "SELECT * FROM topic WHERE discipline_id = ? ORDER BY name"
    return this.connection.all(query, disciplineId)
  }

  private async fetchDisciplineByName(name: string): Promise<any> {
    const queryDisciplineParts = [`SELECT * FROM discipline WHERE ${this.dbType(1)}`]
    if (this.connection.databaseType() === "postgres") {
      queryDisciplineParts.push("AND name ILIKE ?")
    } else {
      queryDisciplineParts.push("AND LOWER(name) LIKE ?")
    }
    const query = queryDisciplineParts.join(" ")
    return this.connection.get(query, `%${name?.trim().toLowerCase()}%`)
  }

  private convertDatabaseDiscipline(disciplineFromDB: any, topicsFromDB: any): DisciplineState {
    const disciplineState: DisciplineState = {
      disciplineId: disciplineFromDB.discipline_id,
      name: disciplineFromDB.name,
      topics: [],
      image: disciplineFromDB.image,
      isActive: !!disciplineFromDB.is_active,
      createdAt: DateBr.create(disciplineFromDB.created_at).value,
      updatedAt: disciplineFromDB.updated_at ? DateBr.create(disciplineFromDB.updated_at).value : null,
    }
    topicsFromDB.map((topic: any) => {
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

  private dbType(value: number): any {
    return this.connection.databaseType() === "postgres" ? Boolean(value) : value
  }

  private mapToDomain(result: DisciplineState): Discipline {
    return Discipline.toDomain(result)
  }

  private async getTopics(disciplineId: string): Promise<TopicState[]> {
    const result = await this.connection.query<TopicState>(`
      SELECT 
        t.topic_id as "topicId",
        t.discipline_id as "disciplineId",
        t.name,
        t.is_topic_classify as "isTopicClassify",
        t.topic_parent_id as "topicParentId",
        t.topic_root_id as "topicRootId",
        t.depth,
        t.dependencies,
        t.obs,
        t.is_active as "isActive",
        t.created_at as "createdAt",
        t.updated_at as "updatedAt"
      FROM topics t
      WHERE t.discipline_id = '${disciplineId}'
      AND t.is_active = true
    `)
    return result.rows
  }

  private async getDiscipline(disciplineId: string): Promise<DisciplineState> {
    return this.connection.one<DisciplineState>(`
      SELECT 
        d.discipline_id as "disciplineId",
        d.name,
        d.image,
        d.is_active as "isActive",
        d.created_at as "createdAt",
        d.updated_at as "updatedAt"
      FROM disciplines d
      WHERE d.discipline_id = '${disciplineId}'
    `)
  }
}
