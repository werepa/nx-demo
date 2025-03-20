import crypto from "crypto"

export abstract class Entity<Props extends { [key: string]: unknown }> {
  protected readonly _id: string
  protected props: Props

  protected constructor(props: Props, idName = "id") {
    const generatedId = crypto.randomUUID()
    this._id = (props[idName] as string) ?? generatedId
    this.props = {
      ...props,
      [idName]: this._id,
    } as Props
  }

  get id(): string {
    return this._id
  }

  set id(value: string) {
    this.props = {
      ...this.props,
      id: value,
    } as Props
  }

  public equals(entity: Entity<Props>): boolean {
    if (entity === null || entity === undefined) {
      return false
    }

    if (this === entity) {
      return true
    }

    return this.props === entity.props
  }
}
