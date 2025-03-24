export class Logger {
  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV === "test"
  }

  success(message: unknown): void {
    if (!this.isTestEnvironment()) {
      console.log("\x1b[32m%s\x1b[0m", message)
    }
  }

  info(message: unknown): void {
    if (!this.isTestEnvironment()) {
      console.log("\x1b[36m%s\x1b[0m", message)
    }
  }

  error(message: unknown): void {
    if (!this.isTestEnvironment()) {
      console.log("\x1b[31m%s\x1b[0m", message)
    }
  }

  warning(message: unknown): void {
    if (!this.isTestEnvironment()) {
      console.log("\x1b[33m%s\x1b[0m", message)
    }
  }
}
