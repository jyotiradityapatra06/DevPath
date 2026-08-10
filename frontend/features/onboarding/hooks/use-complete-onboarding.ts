"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authSessionKey } from "@/features/auth/hooks/use-current-user"
import { completeOnboarding } from "@/lib/api/onboarding"

export function useCompleteOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: (user) => queryClient.setQueryData(authSessionKey, { authenticated: true, user }),
  })
}
