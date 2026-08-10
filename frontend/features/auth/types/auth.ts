export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  name: string
}

export interface AuthSession {
  authenticated: boolean
  user: AuthUser | null
}

export interface AuthUser {
  id: number
  name: string
  email: string
  onboarding_completed: boolean
}

export type RegisteredUser = AuthUser
