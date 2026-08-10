"use client"

import { createContext, useCallback, useMemo } from "react"

import { useCurrentUser } from "@/features/auth/hooks/use-current-user"
import { useLogin } from "@/features/auth/hooks/use-login"
import { useLogout } from "@/features/auth/hooks/use-logout"
import { useRegister } from "@/features/auth/hooks/use-register"
import type { AuthUser, LoginInput, RegisterInput } from "@/features/auth/types/auth"

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const sessionQuery = useCurrentUser()
  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const logoutMutation = useLogout()

  const login = useCallback(
    async (input: LoginInput) => {
      await loginMutation.mutateAsync(input)
    },
    [loginMutation],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      await registerMutation.mutateAsync(input)
    },
    [registerMutation],
  )

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: sessionQuery.data?.authenticated ?? false,
      isLoading: sessionQuery.isLoading,
      user: sessionQuery.data?.user ?? null,
      login,
      register,
      logout,
    }),
    [login, logout, register, sessionQuery.data, sessionQuery.isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
