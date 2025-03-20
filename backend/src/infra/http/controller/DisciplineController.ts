import { Application, Request, Response } from "express"
import {
  GetDisciplines,
  GetDisciplineById,
  GetDisciplineByName,
} from "../../../application/usecase"

/**
 * @swagger
 * tags:
 *   name: Disciplines
 *   description: Discipline management endpoints
 */

export class DisciplineController {
  constructor(
    app: any,
    getDisciplines: GetDisciplines,
    getDisciplineById: GetDisciplineById,
    getDisciplineByName: GetDisciplineByName,
  ) {
    /**
     * @swagger
     * /api/disciplines:
     *   get:
     *     summary: List all disciplines
     *     description: Retrieve a list of all disciplines, with optional search and active status filtering
     *     tags: [Disciplines]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search term to filter disciplines by name
     *       - in: query
     *         name: showAll
     *         schema:
     *           type: boolean
     *         description: Include inactive disciplines in results
     *     responses:
     *       200:
     *         description: List of disciplines retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Discipline'
     *       401:
     *         description: Not authenticated
     */
    app.get("/disciplines", async (req: Request, res: Response) => {
      try {
        const { search, showAll } = req.query
        const output = await getDisciplines.execute({
          search: search as string,
          showAll: showAll === "true",
        })
        res.status(200).json(output.map((discipline) => discipline.toDTO()))
      } catch (error: any) {
        res.status(500).json({ error: error.message })
      }
    })

    /**
     * @swagger
     * /api/disciplines/{id}:
     *   get:
     *     summary: Get discipline by ID
     *     description: Retrieve a single discipline by its ID
     *     tags: [Disciplines]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Discipline ID
     *     responses:
     *       200:
     *         description: Discipline found successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Discipline'
     *       404:
     *         description: Discipline not found
     *       401:
     *         description: Not authenticated
     */
    app.get("/disciplines/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params
        const output = await getDisciplineById.execute(id)
        if (!output) {
          return res.status(404).json({ error: "Discipline not found" })
        }
        res.status(200).json(output.toDTO())
      } catch (error: any) {
        res.status(500).json({ error: error.message })
      }
    })

    /**
     * @swagger
     * /api/disciplines/name/{name}:
     *   get:
     *     summary: Get discipline by name
     *     description: Retrieve a single discipline by its name
     *     tags: [Disciplines]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: name
     *         required: true
     *         schema:
     *           type: string
     *         description: Discipline name
     *     responses:
     *       200:
     *         description: Discipline found successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Discipline'
     *       404:
     *         description: Discipline not found
     *       401:
     *         description: Not authenticated
     */
    app.get("/disciplines/name/:name", async (req: Request, res: Response) => {
      try {
        const { name } = req.params
        const output = await getDisciplineByName.execute(name)
        if (!output) {
          return res.status(404).json({ error: "Discipline not found" })
        }
        res.status(200).json(output.toDTO())
      } catch (error: any) {
        res.status(500).json({ error: error.message })
      }
    })
  }
}
