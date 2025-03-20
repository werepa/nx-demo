import { Application, Request, Response } from "express"
import {
  GetUserByEmail,
  GetUserById,
  GetUsers,
} from "../../../application/usecase"

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

export class UserController {
  constructor(
    app: any,
    getUsers: GetUsers,
    getUserById: GetUserById,
    getUserByEmail: GetUserByEmail,
  ) {
    /**
     * @swagger
     * /api/users:
     *   get:
     *     summary: Get all users
     *     description: Retrieve a list of all users. Can be filtered by active status.
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: showAll
     *         schema:
     *           type: boolean
     *         description: Include inactive users in the results
     *     responses:
     *       200:
     *         description: List of users retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/User'
     *       401:
     *         description: Not authenticated
     *       403:
     *         description: Not authorized to view all users
     */
    app.get("/users", async (req: Request, res: Response) => {
      try {
        const { showAll } = req.query
        const output = await getUsers.execute({ showAll: showAll === "true" })
        res.status(200).json(output.map((user) => user.toDTO()))
      } catch (error: any) {
        res.status(500).json({ error: error.message })
      }
    })

    /**
     * @swagger
     * /api/users/{id}:
     *   get:
     *     summary: Get user by ID
     *     description: Retrieve a single user by their ID
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: User ID
     *     responses:
     *       200:
     *         description: User found successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       404:
     *         description: User not found
     *       401:
     *         description: Not authenticated
     */
    app.get("/users/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params
        const output = await getUserById.execute(id)
        if (!output) {
          return res.status(404).json({ error: "User not found" })
        }
        res.status(200).json(output.toDTO())
      } catch (error: any) {
        res.status(500).json({ error: error.message })
      }
    })

    /**
     * @swagger
     * /api/users/email/{email}:
     *   get:
     *     summary: Get user by email
     *     description: Retrieve a single user by their email address
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: email
     *         required: true
     *         schema:
     *           type: string
     *           format: email
     *         description: User email address
     *     responses:
     *       200:
     *         description: User found successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       404:
     *         description: User not found
     *       401:
     *         description: Not authenticated
     */
    app.get("/users/email/:email", async (req: Request, res: Response) => {
      try {
        const { email } = req.params
        const output = await getUserByEmail.execute(email)
        if (!output) {
          return res.status(404).json({ error: "User not found" })
        }
        res.status(200).json(output.toDTO())
      } catch (error: any) {
        res.status(500).json({ error: error.message })
      }
    })
  }
}
