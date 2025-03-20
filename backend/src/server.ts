import app from "./main_api"
import dotenv from "dotenv"

// Ensure environment variables are loaded
dotenv.config()

const PORT = process.env.PORT || 3030
const NODE_ENV = process.env.NODE_ENV || "development"

// Check for required environment variables
if (process.env.NODE_ENV !== "test" && !process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is not set")
  console.error(
    "Please set DATABASE_URL to a valid PostgreSQL connection string",
  )
  console.error(
    "Example: DATABASE_URL=postgres://username:password@host:port/database",
  )
  process.exit(1)
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`)
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`)

  // Log important environment configurations in development
  if (NODE_ENV === "development") {
    console.log("\nEnvironment Configuration:")
    console.log("------------------------")
    console.log(`NODE_ENV: ${NODE_ENV}`)
    console.log(
      `Database: ${process.env.DATABASE_URL ? "Configured" : "Not Configured"}`,
    )
    console.log(
      `JWT Secret: ${process.env.JWT_SECRET ? "Configured" : "Using default"}`,
    )
    console.log("------------------------\n")
  }
})
