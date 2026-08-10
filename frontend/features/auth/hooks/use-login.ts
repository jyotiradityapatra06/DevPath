"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authSessionKey } from "@/features/auth/hooks/use-current-user"
import { login } from "@/lib/api/auth"

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: (session) => queryClient.setQueryData(authSessionKey, session),
  })
}
