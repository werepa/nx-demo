import { MigrateQuestionOptions } from "../../../application/usecase/MigrateQuestionOptions/MigrateQuestionOptions"
import { Request, Response } from "express"

export class QuestionController {
  constructor(
    app: any,
    // ...other dependencies
    migrateQuestionOptions: MigrateQuestionOptions
  ) {
    // ...existing routes

    /**
     * @swagger
     * /api/questions/migrate-options:
     *   post:
     *     summary: Migrate question options from key to isCorrectAnswer
     *     description: Updates all question options replacing 'key' with 'isCorrectAnswer' property
     *     tags: [Questions]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Migration completed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 updatedCount:
     *                   type: number
     *                 deactivatedCount:
     *                   type: number
     *       500:
     *         description: Server error
     */
    app.post("/questions/migrate-options", async (req: Request, res: Response) => {
      try {
        const output = await migrateQuestionOptions.execute()
        res.status(200).json(output)
      } catch (error: any) {
        res.status(500).json({ error: error.message })
      }
    })
  }
}
