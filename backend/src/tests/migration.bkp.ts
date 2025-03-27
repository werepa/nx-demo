// import { OptionDTO } from '../shared/dto/OptionDTO';
// import pgp from "pg-promise"

// describe("Migration", () => {
//   let pgp_simulex: any
//   let pgp_simulex: any

//   beforeAll(() => {
//     pgp_simulex = pgp()("postgres://postgres:b3r1c4@localhost:5432/simulex")
//     pgp_simulex = pgp()("postgres://postgres:b3r1c4@localhost:5432/simulex")
//   })

//   afterAll(() => {
//     pgp_simulex.$pool.end()
//     pgp_simulex.$pool.end()
//   })

//   test.skip("should migrate all users", async () => {
//     let users = await pgp_simulex.any(`
//       SELECT
//         id_uuid as user_id,
//         nome as name,
//         email,
//         senha as password,
//         perfil as role,
//         ativo as is_active
//       FROM public.usuario`)
//     users = users.map((user: any) => {
//       switch (user.role) {
//         case "Aministrador":
//           user.role = "Administrator"
//           break
//         case "Professor":
//           user.role = "Teacher"
//           break
//         case "Gratuito":
//           user.role = "Free"
//           break
//         case "Dirigido":
//           user.role = "Member"
//           break
//       }
//       return user
//     })
//     await pgp_simulex.none("TRUNCATE TABLE public.user CASCADE")

//     await pgp_simulex.tx(async (t: any) => {
//       const insert = pgp().helpers.insert(users, ["user_id", "name", "email", "password", "role", "is_active"], "user")
//       await t.none(insert)
//     })

//     const newUsers = await pgp_simulex.any("SELECT * FROM public.user")
//     expect(newUsers.length).toEqual(users.length)
//     expect(newUsers[0].user_id).toEqual(users[0].user_id)
//     expect(newUsers[0].name).toEqual(users[0].name)
//     expect(newUsers[0].email).toEqual(users[0].email)
//     expect(newUsers[0].password).toEqual(users[0].password)
//     expect(newUsers[0].role).toEqual(users[0].role)
//     expect(newUsers[0].is_active).toEqual(users[0].is_active)
//   })

//   test.skip("should migrate all entities", async () => {
//     let entities = await pgp_simulex.any(`
//       SELECT
//         id_uuid as entity_id,
//         nome as name,
//         null as created_at
//       FROM public.entidade`)

//     entities = entities.map((entity: any) => {
//       entity.created_at = new Date("01/01/2000").toISOString()
//       return entity
//     })

//     await pgp_simulex.none("TRUNCATE TABLE public.entity CASCADE")

//     await pgp_simulex.tx(async (t: any) => {
//       const insert = pgp().helpers.insert(entities, ["entity_id", "name", "created_at"], "entity")
//       await t.none(insert)
//     })

//     const newEntities = await pgp_simulex.any("SELECT * FROM public.entity")
//     expect(newEntities.length).toEqual(entities.length)
//     expect(newEntities[0].entity_id).toEqual(entities[0].entity_id)
//     expect(newEntities[0].name).toEqual(entities[0].name)
//   })

//   test.skip("should migrate all institutions", async () => {
//     let institutions = await pgp_simulex.any(`
//       SELECT
//         id_uuid as institution_id,
//         nome as name,
//         null as created_at
//       FROM public.orgao`)

//     institutions = institutions.map((institution: any) => {
//       institution.created_at = new Date("01/01/2000").toISOString()
//       return institution
//     })

//     await pgp_simulex.none("TRUNCATE TABLE public.institution CASCADE")

//     await pgp_simulex.tx(async (t: any) => {
//       const insert = pgp().helpers.insert(institutions, ["institution_id", "name", "created_at"], "institution")
//       await t.none(insert)
//     })

//     const newInstitutions = await pgp_simulex.any("SELECT * FROM public.institution")
//     expect(newInstitutions.length).toEqual(institutions.length)
//     expect(newInstitutions[0].institution_id).toEqual(institutions[0].institution_id)
//     expect(newInstitutions[0].name).toEqual(institutions[0].name)
//   })

//   test.skip("should migrate all positions", async () => {
//     let positions = await pgp_simulex.any(`
//       SELECT
//         id_uuid as position_id,
//         nome as name,
//         null as created_at
//       FROM public.cargo`)

//     positions = positions.map((position: any) => {
//       position.created_at = new Date("01/01/2000").toISOString()
//       return position
//     })

//     await pgp_simulex.none("TRUNCATE TABLE public.position CASCADE")

//     await pgp_simulex.tx(async (t: any) => {
//       const insert = pgp().helpers.insert(positions, ["position_id", "name", "created_at"], "position")
//       await t.none(insert)
//     })

//     const newPositions = await pgp_simulex.any("SELECT * FROM public.position")
//     expect(newPositions.length).toEqual(positions.length)
//     expect(newPositions[0].position_id).toEqual(positions[0].position_id)
//     expect(newPositions[0].name).toEqual(positions[0].name)
//   })

//   test.skip("should migrate all sources", async () => {
//     let sources = await pgp_simulex.any(`
//       SELECT
//         id_uuid as source_id,
//         entidade_id_uuid as entity_id,
//         orgao_id_uuid as institution_id,
//         cargo_id_uuid as position_id,
//         ano as year,
//         null as entity,
//         null as institution,
//         null as position
//       FROM public.fonte`)

//     const entities = await pgp_simulex.any(`
//       SELECT
//         id_uuid as entity_id,
//         nome as name
//       FROM public.entidade`)
//     const institutions = await pgp_simulex.any(`
//       SELECT
//         id_uuid as institution_id,
//         nome as name
//       FROM public.orgao`)
//     const positions = await pgp_simulex.any(`
//       SELECT
//         id_uuid as position_id,
//         nome as name
//       FROM public.cargo`)

//     sources = sources.map((source: any) => {
//       source.entity = entities.find((entity: any) => entity.entity_id === source.entity_id)?.name
//       source.institution = institutions.find(
//         (institution: any) => institution.institution_id === source.institution_id
//       )?.name
//       source.position = positions.find((position: any) => position.position_id === source.position_id)?.name
//       return source
//     })

//     await pgp_simulex.none("TRUNCATE TABLE public.source CASCADE")

//     await pgp_simulex.tx(async (t: any) => {
//       const insert = pgp().helpers.insert(
//         sources,
//         ["source_id", "entity_id", "institution_id", "position_id", "year", "entity", "institution", "position"],
//         "source"
//       )
//       await t.none(insert)
//     })

//     const newSources = await pgp_simulex.any("SELECT * FROM public.source")
//     expect(newSources.length).toEqual(sources.length)
//     expect(newSources[0].source_id).toEqual(sources[0].source_id)
//     expect(newSources[0].entity_id).toEqual(sources[0].entity_id)
//     expect(newSources[0].institution_id).toEqual(sources[0].institution_id)
//     expect(newSources[0].position_id).toEqual(sources[0].position_id)
//     expect(newSources[0].year).toEqual(sources[0].year)
//   })

//   test.skip("should migrate all disciplines", async () => {
//     let disciplines = await pgp_simulex.any(`
//       SELECT
//         id_uuid as discipline_id,
//         nome as name,
//         ativo as is_active
//       FROM public.disciplina`)
//     await pgp_simulex.none("TRUNCATE TABLE public.discipline CASCADE")

//     await pgp_simulex.tx(async (t: any) => {
//       const insert = pgp().helpers.insert(disciplines, ["discipline_id", "name", "is_active"], "discipline")
//       await t.none(insert)
//     })

//     const newDisciplines = await pgp_simulex.any("SELECT * FROM public.discipline")
//     expect(newDisciplines.length).toEqual(disciplines.length)
//     expect(newDisciplines[0].discipline_id).toEqual(disciplines[0].discipline_id)
//     expect(newDisciplines[0].name).toEqual(disciplines[0].name)
//     expect(newDisciplines[0].is_active).toEqual(disciplines[0].is_active)
//   })

//   test.skip("should migrate all topics", async () => {
//     let topics = await pgp_simulex.any(`
//       SELECT
//         id,
//         id_uuid as topic_id,
//         nome as name,
//         disciplina_id_uuid as discipline_id,
//         assunto_pai_id_uuid as parent_id,
//         assunto_root_id_uuid as topic_root_id,
//         assunto_pai_id,
//         assunto_root_id,
//         false as is_classify,
//         null as dependencies,
//         obs,
//         ativo as is_active
//       FROM public.assunto`)

//     topics = topics.map((topic: any) => {
//       if (topic.assunto_pai_id && !topic.parent_id) {
//         topic.parent_id = topics.find((t: any) => t.id === topic.assunto_pai_id).topic_id
//       }
//       if (topic.assunto_root_id && !topic.topic_root_id) {
//         const assunto_root = topics.find((t: any) => t.id === topic.assunto_root_id)
//         if (assunto_root) {
//           topic.topic_root_id = assunto_root.topic_id
//         } else {
//           console.log("erro", topic)
//         }
//       }
//       if (topic.name.includes("classificar")) {
//         topic.is_classify = true
//       }
//       topic.dependencies = "[]"
//       return topic
//     })

//     const nulos = topics.filter((topic: any) => !topic.topic_root_id)
//     expect(nulos.length).toEqual(0)

//     await pgp_simulex.none("TRUNCATE TABLE public.topic CASCADE")

//     await pgp_simulex.tx(async (t: any) => {
//       const insert = pgp().helpers.insert(
//         topics,
//         [
//           "topic_id",
//           "name",
//           "discipline_id",
//           "parent_id",
//           "topic_root_id",
//           "is_classify",
//           "dependencies",
//           "obs",
//           "is_active",
//         ],
//         "topic"
//       )
//       await t.none(insert)
//     })

//     const newTopics = await pgp_simulex.any("SELECT * FROM public.topic")
//     expect(newTopics.length).toEqual(topics.length)
//     for (let i = 0; i < newTopics.length; i++) {
//       expect(newTopics[i].topic_id).toEqual(topics[i].topic_id)
//       expect(newTopics[i].name).toEqual(topics[i].name)
//       expect(newTopics[i].discipline_id).toEqual(topics[i].discipline_id)
//       expect(newTopics[i].parent_id).toEqual(topics[i].parent_id)
//       expect(newTopics[i].topic_root_id).toEqual(topics[i].topic_root_id)
//       // se o campo name contiver a string "classificar" então is_classify = true
//       if (topics[i].name.includes("classificar")) {
//         expect(newTopics[i].is_classify).toEqual(true)
//       } else {
//         expect(newTopics[i].is_classify).toEqual(false)
//       }
//       expect(newTopics[i].dependencies).toEqual("[]")
//       expect(newTopics[i].obs).toEqual(topics[i].obs)
//       expect(newTopics[i].is_active).toEqual(topics[i].is_active)
//     }
//   })

//   test.skip("should migrate all questions", async () => {
//     let questions = await pgp_simulex.any(`
//       SELECT
//         id, id_uuid as question_id,
//         assunto_id, assunto_id_uuid as topic_id,
//         assunto_root_id, assunto_root_id_uuid as topic_root_id,
//         fonte_id, fonte_id_uuid as source_id,
//         texto as prompt,
//         ano as year,
//         objetiva as is_multiple_choice,
//         ativo as is_active,
//         hash as simulex_hash,
//         null as options,
//         null as linked_topics
//       FROM public.pergunta
//       `)

//     const options = await pgp_simulex.any(`
//       SELECT
//         id, id_uuid as option_id,
//         pergunta_id, pergunta_id_uuid as question_id,
//         texto as text,
//         gabarito as key,
//         obs
//       FROM public.alternativa`)

//     const topics = await pgp_simulex.any(`
//         SELECT
//           id,
//           id_uuid as topic_id
//         FROM public.assunto`)

//     questions = questions.map((question: any) => {
//       if (question.assunto_root_id && !question.topic_root_id) {
//         question.topic_root_id = topics.find((t: any) => t.id === question.assunto_root_id).topic_id
//       }
//       const questionOptions: OptionDTO[] = []
//       let item = 1
//       options
//         .filter((option: any) => option.question_id === question.question_id)
//         .map((option: any) => {
//           questionOptions.push({
//             questionId: option.question_id,
//             optionId: option.option_id,
//             item: item++,
//             text: option.text,
//             isCorrectAnswer: option.isCorrectAnswer,
//             obs: option.obs,
//           })
//         })
//       question.options = JSON.stringify(questionOptions)
//       question.linked_topics = "[]"
//       return question
//     })

//     await pgp_simulex.none("TRUNCATE TABLE public.question CASCADE")

//     await pgp_simulex.tx(async (t: any) => {
//       const insert = pgp().helpers.insert(
//         questions,
//         [
//           "question_id",
//           "topic_id",
//           "topic_root_id",
//           "source_id",
//           "prompt",
//           "year",
//           "is_multiple_choice",
//           "is_active",
//           "simulex_hash",
//           "options",
//           "linked_topics",
//         ],
//         "question"
//       )
//       await t.none(insert)
//     })

//     const newQuestions = await pgp_simulex.any("SELECT * FROM public.question")
//     expect(newQuestions.length).toEqual(questions.length)
//     for (let i = 0; i < newQuestions.length; i++) {
//       expect(newQuestions[i].question_id).toEqual(questions[i].question_id)
//       expect(newQuestions[i].topic_id).toEqual(questions[i].topic_id)
//       expect(newQuestions[i].topic_root_id).toEqual(questions[i].topic_root_id)
//       expect(newQuestions[i].source_id).toEqual(questions[i].source_id)
//       expect(newQuestions[i].prompt).toEqual(questions[i].prompt)
//       expect(newQuestions[i].year).toEqual(questions[i].year)
//       expect(newQuestions[i].is_multiple_choice).toEqual(questions[i].is_multiple_choice)
//       expect(newQuestions[i].is_active).toEqual(questions[i].is_active)
//       expect(newQuestions[i].simulex_hash).toEqual(questions[i].simulex_hash)
//     }
//   }, 10000000)

//   test.skip("should migrate all obs", async () => {
//     let obs = await pgp_simulex.any(`
//       SELECT
//         id_uuid as obs_id,
//         pergunta_id_uuid as question_id,
//         alternativa_id_uuid as option_id,
//         null as item,
//         obs as text
//       FROM public.obs`)

//     console.log("obs length", obs.length)

//     for (let i = 0; i < obs.length; i++) {
//       const question = await pgp_simulex.any("SELECT * FROM public.question WHERE question_id = $1", obs[i].question_id)
//       if (question.length > 0) {
//         const options = JSON.parse(question[0].options)
//         const option = options.find((option: any) => option.optionId === obs[i].option_id)
//         if (option) {
//           obs[i].item = option.item
//         } else {
//           console.log("option not found", obs[i].option_id)
//         }
//       } else {
//         console.log("error", obs[i].question_id)
//       }
//     }

//     await pgp_simulex.none("TRUNCATE TABLE public.obs CASCADE")

//     await pgp_simulex.tx(async (t: any) => {
//       const insert = pgp().helpers.insert(obs, ["obs_id", "question_id", "option_id", "item", "text"], "obs")
//       await t.none(insert)
//     })

//     const newObs = await pgp_simulex.any("SELECT * FROM public.obs")
//     expect(newObs.length).toEqual(obs.length)
//     expect(newObs[0].obs_id).toEqual(obs[0].obs_id)
//     expect(newObs[0].question_id).toEqual(obs[0].question_id)
//     expect(newObs[0].option_id).toEqual(obs[0].option_id)
//     expect(newObs[0].item).toEqual(obs[0].item)
//     expect(newObs[0].text).toEqual(obs[0].text)
//   })
// })
