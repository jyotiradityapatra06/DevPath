import axios from "axios"

import type { AuthSession, LoginInput, RegisterInput } from "@/features/auth/types/auth"

const authClient = axios.create({
  baseURL: "/api/auth",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
  withCredentials: true,
})

export async function login(input: LoginInput) {
  const { data } = await authClient.post<AuthSession>("/login", input)
  return data
}

export async function register(input: RegisterInput) {
  const { data } = await authClient.post<AuthSession>("/register", input)
  return data
}

export async function logout() {
  await authClient.post("/logout")
}

export async function getCurrentUser() {
  const { data } = await authClient.get<AuthSession>("/session")
  return data
}
