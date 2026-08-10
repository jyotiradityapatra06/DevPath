"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createContext, useCallback, useMemo } from "react"

import { authService } from "@/features/auth/services/auth-service"
import type { LoginInput, RegisterInput } from "@/features/auth/types/auth"

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: authService.session,
    retry: false,
    staleTime: 60_000,
  })

  const markAuthenticated = useCallback(async () => {
    queryClient.setQueryData(["auth", "session"], { authenticated: true })
  }, [queryClient])

  const login = useCallback(
    async (input: LoginInput) => {
      await authService.login(input)
      await markAuthenticated()
    },
    [markAuthenticated],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      await authService.register(input)
      await markAuthenticated()
    },
    [markAuthenticated],
  )

  const logout = useCallback(async () => {
    await authService.logout()
    queryClient.clear()
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: sessionQuery.data?.authenticated ?? false,
      isLoading: sessionQuery.isLoading,
      login,
      register,
      logout,
    }),
    [login, logout, register, sessionQuery.data, sessionQuery.isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
