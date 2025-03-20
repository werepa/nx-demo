import { NextFunction, Request, Response } from "express"
import express from "express"
import HttpServer from "./HttpServer"
import jwt from "jsonwebtoken"

export class ExpressAdapter implements HttpServer {
  app: any

  constructor() {
    this.app = express()
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))

    // Redirect root URL to API docs
    this.app.get("/", (req: Request, res: Response) => {
      res.redirect("/api-docs")
    })

    // Add request logging in development
    if (process.env.NODE_ENV === "development") {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`${req.method} ${req.path}`)
        next()
      })
    }
  }

  on(
    method: string,
    route: string,
    isProtectedRoute: boolean,
    handler: Function,
  ): void {
    if (isProtectedRoute) {
      this.app[method](
        route,
        verifyToken,
        async (req: Request, res: Response) => {
          try {
            const output = await handler(
              { ...req.params, query: req.query, user: (req as any).user },
              req.body,
            )
            return res.json(output)
          } catch (error: any) {
            console.error(
              `Error handling ${method.toUpperCase()} ${route}:`,
              error,
            )
            if (error.message.includes("not found")) {
              return res.status(404).json({ error: error.message })
            }
            if (error.message.includes("unauthorized")) {
              return res.status(403).json({ error: error.message })
            }
            return res.status(500).json({
              error: "Internal Server Error",
              message:
                process.env.NODE_ENV === "development"
                  ? error.message
                  : undefined,
            })
          }
        },
      )
    } else {
      this.app[method](route, async (req: Request, res: Response) => {
        try {
          const output = await handler(
            { ...req.params, query: req.query },
            req.body,
          )
          return res.json(output)
        } catch (error: any) {
          console.error(
            `Error handling ${method.toUpperCase()} ${route}:`,
            error,
          )
          if (error.message.includes("not found")) {
            return res.status(404).json({ error: error.message })
          }
          return res.status(400).json({ error: error.message })
        }
      })
    }
  }

  listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`)
      console.log(`API Documentation: http://localhost:${port}/api-docs`)
    })
  }

  getApp() {
    return this.app
  }
}

async function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret",
    )
    ;(req as any).user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}
