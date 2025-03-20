import { faker } from "@faker-js/faker"
import { Discipline } from "../../domain/entity/Discipline"
import { User } from "../../domain/entity/User"
import { disciplineMock } from "."
import { UserDTO } from "@simulex/models"

interface IUserMockDto {
  userId?: string
  name?: string
  role?: string
}

interface IUserMockWithDisciplineDto extends IUserMockDto {
  discipline?: Discipline
}

export const userMockDTO = (dto: IUserMockDto = {}): UserDTO => {
  const createdAt = faker.date.recent()
  return {
    userId: dto.userId || faker.string.uuid(),
    name: dto.name || faker.person.fullName(),
    email: faker.internet.email(),
    role: dto.role || "Free",
    image: "Base64 ou URL da image",
    isActive: true,
    createdAt: createdAt,
    updatedAt: null,
  }
}

export const userMock = (dto: IUserMockWithDisciplineDto = {}): User => {
  if (!dto.discipline) {
    dto.discipline = disciplineMock()
  }
  return User.toDomain(userMockDTO(dto))
}

export const userFromPersistence = (user: User): UserDTO => {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
    isActive: user.isActive,
    createdAt: user.createdAt.value,
    updatedAt: user.updatedAt ? user.updatedAt.value : null,
  }
}
