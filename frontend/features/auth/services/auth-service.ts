import { getCurrentUser, login, logout, register } from "@/lib/api/auth"

export const authService = { login, register, logout, session: getCurrentUser }
