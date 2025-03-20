export function stringifyWithCircularRefs(obj: unknown): string {
  const seen = new WeakMap()

  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]"
      }
      seen.set(value, true)
    }
    return value
  })
}
