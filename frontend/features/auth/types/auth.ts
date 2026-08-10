export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  name: string
}

export interface AuthSession {
  authenticated: boolean
}

export interface RegisteredUser {
  id: number
  name: string
  email: string
}
