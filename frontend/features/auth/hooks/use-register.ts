"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authSessionKey } from "@/features/auth/hooks/use-current-user"
import { register } from "@/lib/api/auth"

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: register,
    onSuccess: (session) => queryClient.setQueryData(authSessionKey, session),
  })
}
