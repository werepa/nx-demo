import { randomUUID } from "crypto"

export abstract class Entity<T> {
  protected readonly _id: string
  protected readonly props: T

  constructor(props: T, idName = "id") {
    const generatedId = randomUUID()
    this._id = props[idName] ?? generatedId
    this.props = props
    this.props[idName] = this._id
  }

  get id(): string {
    return this._id
  }

  set id(value: string) {
    this.props["id"] = value
  }

  public equals(entity: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false
    }

    if (this === entity) {
      return true
    }

    return this.props === entity.props
  }

  /**
   * Convert entity to DTO format for API responses
   * @returns Object ready for API response
   */
  abstract toDTO(): unknown
}
