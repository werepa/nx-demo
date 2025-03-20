import { Application, Request, Response } from "express"
import { CreateUser, LoginUser, LogoutUser } from "../../../application/usecase"

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

export class AuthController {
  constructor(
    app: any,
    createUser: CreateUser,
    loginUser: LoginUser,
    logoutUser: LogoutUser,
  ) {
    /**
     * @swagger
     * /api/auth/signup:
     *   post:
     *     summary: Create a new user account
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *                 format: password
     *                 minLength: 6
     *     responses:
     *       201:
     *         description: User created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: Invalid input data
     *       409:
     *         description: Email already exists
     */
    app.post("/auth/signup", async (req: Request, res: Response) => {
      try {
        const output = await createUser.execute(req.body)
        res.status(201).json(output.toDTO())
      } catch (error: any) {
        if (error.message.includes("already exists")) {
          res.status(409).json({ error: error.message })
        } else {
          res.status(400).json({ error: error.message })
        }
      }
    })

    /**
     * @swagger
     * /api/auth/signin:
     *   post:
     *     summary: Authenticate user and get token
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *                 format: password
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                 user:
     *                   $ref: '#/components/schemas/User'
     *       401:
     *         description: Invalid credentials
     *       400:
     *         description: Invalid input data
     */
    app.post("/auth/signin", async (req: Request, res: Response) => {
      try {
        const output = await loginUser.execute(req.body)
        res.status(200).json(output)
      } catch (error: any) {
        if (error.message.includes("Invalid credentials")) {
          res.status(401).json({ error: error.message })
        } else {
          res.status(400).json({ error: error.message })
        }
      }
    })

    /**
     * @swagger
     * /api/auth/logout:
     *   post:
     *     summary: Logout user
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Successfully logged out
     *       401:
     *         description: Not authenticated
     */
    app.post("/auth/logout", async (req: Request, res: Response) => {
      try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) {
          return res.status(401).json({ error: "No token provided" })
        }
        await logoutUser.execute(token)
        res.status(200).json({ message: "Logged out successfully" })
      } catch (error: any) {
        res.status(401).json({ error: error.message })
      }
    })
  }
}
