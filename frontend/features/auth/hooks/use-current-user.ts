"use client"

import { useQuery } from "@tanstack/react-query"

import { getCurrentUser } from "@/lib/api/auth"

export const authSessionKey = ["auth", "session"] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: authSessionKey,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 60_000,
  })
}
