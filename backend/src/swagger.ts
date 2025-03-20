import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { Express } from "express"
import path from "path"

const options: swaggerJsdoc.OAS3Options = {
  failOnErrors: true,
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Simulex API",
      version: "2.0.0",
      description: "API documentation for Simulex quiz/exam simulation system",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            userId: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: {
              type: "string",
              enum: ["Free", "Member", "Teacher", "Administrator"],
            },
            image: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        Discipline: {
          type: "object",
          properties: {
            disciplineId: { type: "string" },
            name: { type: "string" },
            topics: {
              type: "array",
              items: { $ref: "#/components/schemas/Topic" },
            },
            image: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        Topic: {
          type: "object",
          properties: {
            topicId: { type: "string" },
            disciplineId: { type: "string" },
            name: { type: "string" },
            isTopicClassify: { type: "boolean" },
            topicParentId: { type: "string", nullable: true },
            topicRootId: { type: "string" },
            depth: { type: "number" },
            dependencies: { type: "array", items: { type: "string" } },
            obs: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        Quiz: {
          type: "object",
          properties: {
            quizId: { type: "string" },
            userId: { type: "string" },
            discipline: { $ref: "#/components/schemas/Discipline" },
            topicsRoot: {
              type: "array",
              items: { $ref: "#/components/schemas/Topic" },
            },
            quizType: {
              type: "string",
              enum: ["Random", "Learning", "Review", "Check"],
            },
            answers: {
              type: "array",
              items: { $ref: "#/components/schemas/QuizAnswer" },
            },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        QuizAnswer: {
          type: "object",
          properties: {
            quizAnswerId: { type: "string" },
            quizId: { type: "string" },
            questionId: { type: "string" },
            topicId: { type: "string" },
            correctOptionId: { type: "string", nullable: true },
            userOptionId: { type: "string", nullable: true },
            isUserAnswerCorrect: { type: "boolean" },
            canRepeat: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Question: {
          type: "object",
          properties: {
            questionId: { type: "string" },
            disciplineId: { type: "string" },
            topicId: { type: "string" },
            text: { type: "string" },
            explanation: { type: "string" },
            difficulty: {
              type: "string",
              enum: ["Easy", "Medium", "Hard"],
            },
            options: {
              type: "array",
              items: { $ref: "#/components/schemas/QuestionOption" },
            },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        QuestionOption: {
          type: "object",
          properties: {
            optionId: { type: "string" },
            questionId: { type: "string" },
            text: { type: "string" },
            isCorrect: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./infra/http/controller/*.ts", "./infra/http/controller/**/*.ts"],
}

const swaggerSpec = swaggerJsdoc(options)

export function setupSwagger(app: Express): void {
  // Serve swagger.json
  app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.send(swaggerSpec)
  })

  // Mount Swagger UI at /api-docs
  app.use("/api-docs", swaggerUi.serve)
  app.get(
    "/api-docs",
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        displayOperationId: false,
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
        docExpansion: "list",
        filter: true,
        showExtensions: true,
      },
    }),
  )
}
