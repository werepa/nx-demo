export type UserDTO = {
  userId: string
  name: string
  email: string
  role: string
  image: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date | null
}

export type UserUpdateDTO = {
  name?: string
  email?: string
  password?: string
  role?: string
  isActive?: boolean
}

export type LoginDTO = {
  user: UserDTO
  token: string
}
