import { DateBr } from "../../shared/domain/valueObject"
import { Discipline, Topic, TopicList } from "."
import { DisciplineFromPersistence } from "../../shared/models"
import { topicMock } from "../../tests/mocks"

describe("Entity => Discipline", () => {
  let portugues: Discipline
  let portuguesClassificar: Topic
  let pronomes: Topic
  let crase: Topic
  let palavrasRepetidas: Topic
  let palavrasEspeciais: Topic
  let distancia: Topic
  let terra: Topic
  let palavrasMasculinas: Topic
  let nomesCidades: Topic
  let topicInactive: Topic

  const createDisciplinePortugues = () => {
    portugues = Discipline.create({ name: "Português" })
    portuguesClassificar = portugues.topics.getItems()[0]

    pronomes = Topic.create({ name: "Pronomes" })
    crase = Topic.create({ name: "Crase" })
    palavrasRepetidas = Topic.create({ name: "Palavras repetidas" })
    palavrasEspeciais = Topic.create({ name: "Palavras especiais" })
    distancia = Topic.create({ name: "Distância" })
    terra = Topic.create({ name: "Terra" })
    palavrasMasculinas = Topic.create({ name: "Palavras masculinas" })
    nomesCidades = Topic.create({ name: "Nomes de cidades" })
    topicInactive = Topic.create({ name: "Topic Inactive" })
    topicInactive.deactivate()

    portugues.topics.add(pronomes)
    portugues.topics.add(crase)
    portugues.topics.add(palavrasRepetidas)
    portugues.topics.add(palavrasEspeciais)
    portugues.topics.add(distancia)
    portugues.topics.add(terra)
    portugues.topics.add(palavrasMasculinas)
    portugues.topics.add(nomesCidades)

    portugues.setTopicParent({ topic: palavrasRepetidas, topicParent: crase })
    portugues.setTopicParent({ topic: palavrasEspeciais, topicParent: crase })
    portugues.setTopicParent({
      topic: distancia,
      topicParent: palavrasEspeciais,
    })
    portugues.setTopicParent({ topic: terra, topicParent: palavrasEspeciais })
    portugues.setTopicParent({ topic: palavrasMasculinas, topicParent: crase })
    portugues.setTopicParent({ topic: nomesCidades, topicParent: crase })
  }

  it("should create an instance of Discipline with valid properties", () => {
    const props = {
      name: "Português",
    }
    const discipline1 = Discipline.create(props)
    expect(discipline1).toBeInstanceOf(Discipline)
    expect(discipline1.disciplineId).toHaveLength(36)
    expect(discipline1.name).toBe("Português")
    expect(discipline1.topics.getCount()).toBe(1)
    expect(discipline1.topics).toBeInstanceOf(TopicList)
    expect(discipline1.topics.getItems()[0].name).toBe("A classificar")
    expect(discipline1.topics.getItems()[0].isTopicClassify).toBe(true)
    expect(discipline1.image).toBe("Base64 ou URL da image")
    expect(discipline1.isActive).toBe(true)
    expect(discipline1.createdAt).toBeInstanceOf(DateBr)
    expect(discipline1.updatedAt).toBeNull()

    const discipline2 = Discipline.create({ name: "Matemática" })
    expect(discipline2).toBeInstanceOf(Discipline)
    expect(discipline2.disciplineId).toHaveLength(36)
  })

  it("should return a topic by topicId or by name", () => {
    createDisciplinePortugues()
    expect(portugues.topic({ topicId: crase.topicId })).toEqual(crase)
    expect(portugues.topic({ name: "Crase" })).toEqual(crase)
    expect(portugues.topic({ topicId: pronomes.topicId })).toEqual(pronomes)
    expect(portugues.topic({ name: "Pronomes" })).toEqual(pronomes)
    expect(portugues.topic({ topicId: distancia.topicId })).toEqual(distancia)
    expect(portugues.topic({ name: "Distância" })).toEqual(distancia)
  })

  it("should create the topic tree of a discipline", () => {
    const portugues = Discipline.create({ name: "Português" })
    const classificar = portugues.topics.getItems()[0]

    const pronomes = Topic.create({ name: "Pronomes" })
    const crase = Topic.create({ name: "Crase" })
    const palavrasEspeciais = Topic.create({ name: "Palavras especiais" })
    const distância = Topic.create({ name: "Distância" })

    portugues.topics.add(pronomes)
    portugues.topics.add(crase)
    portugues.topics.add(palavrasEspeciais)
    portugues.topics.add(distância)

    expect(portugues.topics.getCount()).toBe(5)
    expect(portugues.topics.getItems()[0].name).toBe("A classificar")
    expect(pronomes.disciplineId).toBe(portugues.disciplineId)

    expect(crase.topicParentId).toBe(null)
    expect(crase.topicRootId).toBe(crase.topicId)
    expect(crase.depth).toBe(1)
    expect(crase.isRoot()).toBe(true)
    expect(palavrasEspeciais.isRoot()).toBe(true)
    expect(distância.isRoot()).toBe(true)

    portugues.setTopicParent({ topic: palavrasEspeciais, topicParent: crase })
    expect(palavrasEspeciais.isRoot()).toBe(false)
    expect(palavrasEspeciais.topicParentId).toBe(crase.topicId)
    expect(palavrasEspeciais.topicRootId).toBe(crase.topicId)
    expect(palavrasEspeciais.depth).toBe(2)

    portugues.setTopicParent({
      topic: distância,
      topicParent: palavrasEspeciais,
    })
    expect(distância.isRoot()).toBe(false)
    expect(distância.topicParentId).toBe(palavrasEspeciais.topicId)
    expect(distância.topicRootId).toBe(crase.topicId)
    expect(distância.depth).toBe(3)

    const topicNonExistent = topicMock({ name: "Inexistente" })
    expect(() =>
      portugues.setTopicParent({
        topic: topicNonExistent,
        topicParent: pronomes,
      }),
    ).toThrow(`Topic ID:${topicNonExistent.topicId} does not exist!`)

    expect(() =>
      portugues.setTopicParent({
        topic: pronomes,
        topicParent: topicNonExistent,
      }),
    ).toThrow(`TopicParent ID:${topicNonExistent.topicId} does not exist!`)

    expect(() =>
      portugues.setTopicParent({ topic: null, topicParent: pronomes }),
    ).toThrow(`The child topic is required`)
    expect(() =>
      portugues.setTopicParent({ topic: pronomes, topicParent: null }),
    ).toThrow(`The parent topic is required`)

    expect(() =>
      portugues.setTopicParent({ topic: null, topicParent: pronomes }),
    ).toThrow(`The child topic is required`)

    expect(() =>
      portugues.setTopicParent({ topic: pronomes, topicParent: pronomes }),
    ).toThrow(`A topic cannot be its own child!`)

    expect(() =>
      portugues.setTopicParent({ topic: pronomes, topicParent: classificar }),
    ).toThrow(`Topic "A classificar" cannot have children!`)

    expect(() =>
      portugues.setTopicParent({ topic: classificar, topicParent: pronomes }),
    ).toThrow(`Topic "A classificar" cannot be a child of another topic!`)
  })

  it("should list all child topics of a topic recursively", () => {
    createDisciplinePortugues()
    expect(portugues.topicsChildrenRecursive(crase.topicId)).toHaveLength(6)
    expect(
      portugues.topicsChildrenRecursive(palavrasRepetidas.topicId),
    ).toHaveLength(0)
    expect(
      portugues.topicsChildrenRecursive(palavrasEspeciais.topicId),
    ).toHaveLength(2)
    expect(
      portugues.topicsChildrenRecursive(palavrasEspeciais.topicId),
    ).toEqual([distancia, terra])
    expect(portugues.topicsChildrenRecursive(distancia.topicId)).toHaveLength(0)
    expect(portugues.topicsChildrenRecursive(terra.topicId)).toHaveLength(0)
    expect(
      portugues.topicsChildrenRecursive(palavrasMasculinas.topicId),
    ).toHaveLength(0)
    expect(
      portugues.topicsChildrenRecursive(nomesCidades.topicId),
    ).toHaveLength(0)
  })

  it("should list the path from the topicRoot to a topic", () => {
    createDisciplinePortugues()
    expect(portugues.topicPath(crase.topicId)).toHaveLength(1)
    expect(portugues.topicPath(crase.topicId)).toEqual([crase])
    expect(portugues.topicPath(palavrasRepetidas.topicId)).toHaveLength(2)
    expect(portugues.topicPath(palavrasRepetidas.topicId)).toEqual([
      crase,
      palavrasRepetidas,
    ])
    expect(portugues.topicPath(palavrasEspeciais.topicId)).toHaveLength(2)
    expect(portugues.topicPath(palavrasEspeciais.topicId)).toEqual([
      crase,
      palavrasEspeciais,
    ])
    expect(portugues.topicPath(distancia.topicId)).toHaveLength(3)
    expect(portugues.topicPath(distancia.topicId)).toEqual([
      crase,
      palavrasEspeciais,
      distancia,
    ])
    expect(portugues.topicPath(terra.topicId)).toHaveLength(3)
    expect(portugues.topicPath(terra.topicId)).toEqual([
      crase,
      palavrasEspeciais,
      terra,
    ])
  })

  it("should list the topics of a discipline", () => {
    createDisciplinePortugues()

    expect(portugues.topicsRoot()).toHaveLength(3)
    expect(portugues.topicsRoot()[0].name).toBe("A classificar")
    expect(portugues.topicsRoot()[1].name).toBe("Crase")
    expect(portugues.topicsRoot()[2].name).toBe("Pronomes")
    expect(portugues.topicsChildren(crase.topicId)).toHaveLength(4)
    expect(portugues.topicsChildren(palavrasEspeciais.topicId)).toHaveLength(2)
  })

  it("should throw an error when creating an instance without the required properties", () => {
    // @ts-ignore
    expect(() => Discipline.create({})).toThrow(
      "Discipline - Missing required property: name",
    )
  })

  it("should convert a Discipline instance to a DTO object", () => {
    createDisciplinePortugues()
    const disciplineDTO = portugues.toDTO()
    expect(disciplineDTO.disciplineId).toBe(portugues.disciplineId)
    expect(disciplineDTO.name).toBe(portugues.name)
    expect(disciplineDTO.topics).toEqual([
      portuguesClassificar.toDTO(),
      crase.toDTO(),
      distancia.toDTO(),
      nomesCidades.toDTO(),
      palavrasEspeciais.toDTO(),
      palavrasMasculinas.toDTO(),
      palavrasRepetidas.toDTO(),
      pronomes.toDTO(),
      terra.toDTO(),
    ])
    expect(disciplineDTO.image).toBe(portugues.image)
    expect(disciplineDTO.isActive).toBe(portugues.isActive)
    expect(disciplineDTO.createdAt).toBe(portugues.createdAt.formatoBr)
    expect(disciplineDTO.updatedAt).toBeNull()
  })

  it("should convert a persistence object to a Discipline instance", () => {
    const disciplineFromPersistence: DisciplineFromPersistence = {
      disciplineId: portugues.disciplineId,
      name: portugues.name,
      topics: [
        {
          topicId: crase.topicId,
          disciplineId: crase.disciplineId,
          name: crase.name,
          isTopicClassify: false,
          topicParentId: crase.topicParentId ?? "",
          topicRootId: crase.topicId,
          depth: 1,
          dependencies: crase.dependencies,
          obs: null,
          isActive: true,
          createdAt: DateBr.create().value,
          updatedAt: null,
        },
        {
          topicId: distancia.topicId,
          disciplineId: distancia.disciplineId,
          name: distancia.name,
          isTopicClassify: false,
          topicParentId: distancia.topicParentId,
          topicRootId: distancia.topicId,
          depth: 3,
          dependencies: distancia.dependencies,
          obs: null,
          isActive: true,
          createdAt: DateBr.create().value,
          updatedAt: null,
        },
        {
          topicId: palavrasEspeciais.topicId,
          disciplineId: palavrasEspeciais.disciplineId,
          name: palavrasEspeciais.name,
          isTopicClassify: false,
          topicParentId: palavrasEspeciais.topicParentId,
          topicRootId: palavrasEspeciais.topicId,
          depth: 2,
          dependencies: palavrasEspeciais.dependencies,
          obs: null,
          isActive: true,
          createdAt: DateBr.create().value,
          updatedAt: null,
        },
        {
          topicId: portuguesClassificar.topicId,
          disciplineId: portuguesClassificar.disciplineId,
          name: portuguesClassificar.name,
          isTopicClassify: false,
          topicParentId: portuguesClassificar.topicParentId,
          topicRootId: portuguesClassificar.topicId,
          depth: 1,
          dependencies: portuguesClassificar.dependencies,
          obs: null,
          isActive: true,
          createdAt: DateBr.create().value,
          updatedAt: null,
        },
      ],
      image: "Base64 ou URL da image",
      isActive: true,
      createdAt: DateBr.create().value,
      updatedAt: null,
    }
    const discipline = Discipline.toDomain(disciplineFromPersistence)
    expect(discipline).toBeInstanceOf(Discipline)
    expect(discipline.disciplineId).toBe(disciplineFromPersistence.disciplineId)
    expect(discipline.name).toBe(disciplineFromPersistence.name)
    expect(discipline.topics.getCount()).toBe(4)
    expect(discipline.topics.getItems()[0].name).toBe("A classificar")
    expect(discipline.topics.getItems()[1].name).toBe("Crase")
    expect(discipline.topics.getItems()[2].name).toBe("Distância")
    expect(discipline.topics.getItems()[3].name).toBe("Palavras especiais")
    expect(discipline.topics.getItems()[0].depth).toBe(1)
    expect(discipline.topics.getItems()[1].depth).toBe(1)
    expect(discipline.topics.getItems()[2].depth).toBe(3)
    expect(discipline.topics.getItems()[3].depth).toBe(2)
    expect(discipline.image).toBe(disciplineFromPersistence.image)
    expect(discipline.isActive).toBe(disciplineFromPersistence.isActive)
    expect(discipline.createdAt.value).toBe(disciplineFromPersistence.createdAt)
    expect(discipline.updatedAt).toBeNull()
  })

  it("should activate and deactivate a discipline", () => {
    expect(portugues.isActive).toBe(true)
    portugues.deactivate()
    expect(portugues.isActive).toBe(false)
    portugues.activate()
    expect(portugues.isActive).toBe(true)
  })
})
