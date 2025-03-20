# Simulex GitHub Copilot Instructions

## Project Structure

This is a quiz/exam simulation system built as an Nx monorepo with:

- Backend: Express/Node.js with TypeScript
- Frontend: Angular
- Mobile: Ionic

## Coding Standards

### Architecture

- Follow Clean Architecture principles
- Use repository pattern for data access
- Use use cases for business logic
- Maintain separation between domain entities and DTOs

### Testing

- Use Jest for unit and integration tests
- Don't mock database connection in tests, use `getTestDatabaseAdapter()`
- Write both unit tests for use cases and integration tests with fixtures
- Follow AAA pattern (Arrange, Act, Assert) in test structure

### Naming Conventions

- Use PascalCase for classes, interfaces, and types
- Use camelCase for variables, functions, and method names
- Add suffixes to classes based on their role:
  - `*Repository` for repositories
  - `*UseCase` or just descriptive action names for use cases
  - `*Controller` for controllers
  - `*Service` for services
  - `*Factory` for factories

### Database Access

- Use repositories for all database operations
- Maintain transaction handling at the use case level
- Always clear repositories before tests to ensure clean state

### Dependencies

- Always import shared models from `@simulex/models`
- Avoid direct database access from controllers or use cases
- Use dependency injection for all components

### Code Style

- Maximum line length: 125 characters
- No semicolons in TypeScript/JavaScript
- Use 2 spaces for indentation
- Use Prettier for code formatting
- Use ESLint for linting

### Error Handling

- Use custom error classes that extend Error
- Include appropriate HTTP status codes in API errors
- Use consistent error responses across the API

### API Documentation

- Use Swagger/OpenAPI for documenting all API routes
- Document routes using `@swagger` JSDoc annotations
- Should be customCss: ".swagger-ui .topbar { display: none }"
- Include for each endpoint:
  - Route path and HTTP method
  - Request parameters (path, query, body)
  - Response schema and status codes
  - Authentication requirements
  - Description and summary
- Follow this pattern for swagger documentation:

```typescript
/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Retrieve a quiz by ID
 *     description: Returns a single quiz with all its questions and options
 *     tags: [Quizzes]
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
 *       500:
 *         description: Server error
 */
```

- Group related endpoints using tags
- Define reusable components in separate schema files
- Keep documentation in sync with implementation
- Include example requests and responses

### TypeScript Configuration

- Use solution-style TypeScript projects
- Enable strict type checking
- Configure proper project references:
  - Use empty `files` array
  - Include proper `references` section
  - Set up correct path mappings
- Follow Nx module boundaries
- Use proper import paths with aliases:

  ```typescript
  // ✅ Correct
  import { MyModel } from "@simulex/models"

  // ❌ Incorrect
  import { MyModel } from "../../libs/models/src"
  ```

### Build Configuration

- Enable incremental builds
- Use composite project references
- Configure proper output directories
- Maintain clean dependency graphs
- Run `nx graph` to validate project dependencies

### TypeScript Compiler Options

- Enable strict mode for type safety:
  - `noImplicitAny: true`
  - `strictNullChecks: true`
  - `strictFunctionTypes: true`
- Use `esModuleInterop` for compatibility
- Configure proper module resolution
- Set up declaration maps for better debugging

## Best Practices

- Write small, focused functions and classes
- Use pure functions where possible
- Document complex business logic with comments
- Group related functionality in modules
- Write meaningful commit messages following conventional commits
