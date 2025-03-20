import { UserState } from "../../shared/models"
import { DateBr } from "../../shared/domain/valueObject"
import { RoleEnum } from "../../shared/enum"
import { Entity } from "../../shared/domain/entity"
import { Email, UserPassword, UserRole } from "../valueObject"
import { UserDTO } from "@simulex/models"
import { randomUUID } from "crypto"

interface UserProps {
  userId: string
  name: string
  email: Email
  password: UserPassword
  role: UserRole
  image: string
  isActive: boolean
  createdAt: DateBr
  updatedAt: DateBr | null
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps) {
    super(props, "userId")
  }

  static create(dto: CreateUserInput): User {
    if (!dto.email || !dto.password) {
      throw new Error("Missing required properties")
    }

    const userId = randomUUID()
    const props: UserProps = {
      userId,
      name: dto.name,
      email: Email.create(dto.email),
      password: UserPassword.create(dto.password),
      role: UserRole.create("free"),
      image: "Base64 ou URL da image",
      isActive: true,
      createdAt: DateBr.create(),
      updatedAt: null,
    }

    const user = new User(props)
    return user
  }

  public static toDomain(dto: UserState): User {
    if (!dto.userId || !dto.name || !dto.email || !dto.password || !dto.role || !dto.createdAt) {
      throw new Error("Missing required properties")
    }

    return new User({
      userId: dto.userId,
      name: dto.name,
      email: Email.create(dto.email),
      password: UserPassword.create(dto.password, true),
      role: UserRole.create(dto.role),
      image: dto.image,
      isActive: !!dto.isActive,
      createdAt: DateBr.create(dto.createdAt),
      updatedAt: dto.updatedAt ? DateBr.create(dto.updatedAt) : null,
    })
  }

  get userId() {
    return this.props.userId
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email.value
  }

  get password() {
    return this.props.password.value
  }

  get role() {
    return this.props.role.value
  }

  get image() {
    return this.props.image
  }

  get isActive() {
    return this.props.isActive
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  public passwordValidate(password: string): boolean {
    return this.props.password.validate(password)
  }

  public isRole(role: RoleEnum): boolean {
    return this.props.role.value === UserRole.create(role).value
  }

  public updateRole(role: UserRole) {
    this.props.role = role
  }

  public updateImage(image: string) {
    this.props.image = image
  }

  public updatePassword(password: string) {
    this.props.password = UserPassword.create(password)
  }

  public activate() {
    this.props.isActive = true
  }

  public deactivate() {
    this.props.isActive = false
  }

  public updateName(name: string) {
    this.props.name = name
  }

  public updateEmail(email: Email) {
    this.props.email = email
  }

  public toDTO(): UserDTO {
    return {
      userId: this.userId,
      name: this.name,
      email: this.email,
      role: this.role,
      image: this.image,
      isActive: this.isActive,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
    }
  }
}

export type CreateUserInput = {
  name?: string
  email: string
  password: string
}
