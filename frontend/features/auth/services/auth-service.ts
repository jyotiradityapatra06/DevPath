import axios from "axios"

import type {
  AuthSession,
  LoginInput,
  RegisteredUser,
  RegisterInput,
} from "@/features/auth/types/auth"

const authClient = axios.create({
  baseURL: "/api/auth",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
  withCredentials: true,
})

export const authService = {
  async login(input: LoginInput) {
    const { data } = await authClient.post<AuthSession>("/login", input)
    return data
  },

  async register(input: RegisterInput) {
    const { data } = await authClient.post<RegisteredUser>("/register", input)
    return data
  },

  async logout() {
    await authClient.post("/logout")
  },

  async session() {
    const { data } = await authClient.get<AuthSession>("/session")
    return data
  },
}
