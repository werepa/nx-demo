import { Application, Request, Response } from "express"
import { CreateQuiz, GetQuizzes, GetQuizById, GetNextQuestion, CheckQuizAnswer } from "../../../application/usecase"

/**
 * @swagger
 * tags:
 *   name: Quizzes
 *   description: Quiz management endpoints
 */

export class QuizController {
  constructor(
    app: any,
    createQuiz: CreateQuiz,
    getQuizzes: GetQuizzes,
    getQuizById: GetQuizById,
    getNextQuestion: GetNextQuestion,
    checkQuizAnswer: CheckQuizAnswer
  ) {
    /**
     * @swagger
     * /api/quizzes:
     *   post:
     *     summary: Create a new quiz
     *     description: Creates a new quiz for a user in a specific discipline
     *     tags: [Quizzes]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *               - disciplineId
     *             properties:
     *               userId:
     *                 type: string
     *               disciplineId:
     *                 type: string
     *               topicsRoot:
     *                 type: array
     *                 items:
     *                   type: string
     *               quizType:
     *                 type: string
     *                 enum: [Random, Learning, Review, Check]
     *     responses:
     *       201:
     *         description: Quiz created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Quiz'
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Not authenticated
     *       404:
     *         description: User or discipline not found
     */
    app.post("/quizzes", async (req: Request, res: Response) => {
      try {
        const output = await createQuiz.execute(req.body)
        res.status(201).json(output)
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes("not found")) {
          res.status(404).json({ error: error.message })
        } else if (error instanceof Error) {
          res.status(400).json({ error: error.message })
        } else {
          res.status(400).json({ error: "An unknown error occurred" })
        }
      }
    })

    /**
     * @swagger
     * /api/quizzes:
     *   get:
     *     summary: Get all quizzes
     *     description: Retrieve a list of all quizzes, optionally filtered by user ID
     *     tags: [Quizzes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: userId
     *         schema:
     *           type: string
     *         description: Filter quizzes by user ID
     *     responses:
     *       200:
     *         description: List of quizzes retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Quiz'
     *       401:
     *         description: Not authenticated
     */
    app.get("/quizzes", async (req: Request, res: Response) => {
      try {
        const { userId, disciplineId } = req.query
        if (!userId || typeof userId !== "string") {
          throw new Error("userId is required")
        }
        const output = await getQuizzes.execute({
          userId,
          disciplineId: disciplineId as string | undefined,
        })
        res.status(200).json(output.map((quiz) => quiz.toDTO()))
      } catch (error: any) {
        res.status(500).json({ error: error.message })
      }
    })

    /**
     * @swagger
     * /api/quizzes/{id}:
     *   get:
     *     summary: Get quiz by ID
     *     description: Retrieve a single quiz by its ID with all its details
     *     tags: [Quizzes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Quiz ID
     *     responses:
     *       200:
     *         description: Quiz found successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Quiz'
     *       404:
     *         description: Quiz not found
     *       401:
     *         description: Not authenticated
     */
    app.get("/quizzes/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params
        const output = await getQuizById.execute(id)
        if (!output) {
          return res.status(404).json({ error: "Quiz not found" })
        }
        res.status(200).json(output.toDTO())
      } catch (error: any) {
        res.status(500).json({ error: error.message })
      }
    })

    /**
     * @swagger
     * /api/quizzes/{id}/next-question:
     *   get:
     *     summary: Get next question
     *     description: Get the next question for a quiz
     *     tags: [Quizzes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Quiz ID
     *     responses:
     *       200:
     *         description: Next question retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Question'
     *       404:
     *         description: Quiz not found or no more questions available
     *       401:
     *         description: Not authenticated
     */
    app.get("/quizzes/:id/next-question", async (req: Request, res: Response) => {
      try {
        const { id } = req.params
        const output = await getNextQuestion.execute({ quizId: id })
        if (!output) {
          return res.status(404).json({ error: "No more questions available" })
        }
        res.status(200).json(output.toDTO())
      } catch (error: any) {
        if (error.message.includes("not found")) {
          res.status(404).json({ error: error.message })
        } else {
          res.status(500).json({ error: error.message })
        }
      }
    })

    /**
     * @swagger
     * /api/quizzes/{id}/answer:
     *   post:
     *     summary: Submit quiz answer
     *     description: Submit an answer for a quiz question
     *     tags: [Quizzes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Quiz ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *               - disciplineId
     *               - quizAnswer
     *             properties:
     *               userId:
     *                 type: string
     *               disciplineId:
     *                 type: string
     *               quizAnswer:
     *                 type: object
     *                 required:
     *                   - quizId
     *                   - questionId
     *                 properties:
     *                   quizId:
     *                     type: string
     *                   questionId:
     *                     type: string
     *                   optionId:
     *                     type: string
     *     responses:
     *       200:
     *         description: Answer submitted successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/QuizAnswer'
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Not authenticated
     *       404:
     *         description: Quiz or question not found
     */
    app.post("/quizzes/:id/answer", async (req: Request, res: Response) => {
      try {
        const { id } = req.params
        const output = await checkQuizAnswer.execute({
          ...req.body,
          quizAnswer: {
            ...req.body.quizAnswer,
            quizId: id,
          },
        })
        res.status(200).json(output)
      } catch (error: any) {
        if (error.message.includes("not found")) {
          res.status(404).json({ error: error.message })
        } else {
          res.status(400).json({ error: error.message })
        }
      }
    })
  }
}
