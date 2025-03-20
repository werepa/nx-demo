export class Logger {
  success(message: unknown): void {
    console.log("\x1b[32m%s\x1b[0m", message)
  }

  info(message: unknown): void {
    console.log("\x1b[36m%s\x1b[0m", message)
  }

  error(message: unknown): void {
    console.log("\x1b[31m%s\x1b[0m", message)
  }

  warning(message: unknown): void {
    console.log("\x1b[33m%s\x1b[0m", message)
  }
}
