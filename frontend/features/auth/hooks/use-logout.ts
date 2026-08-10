"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { authSessionKey } from "@/features/auth/hooks/use-current-user"
import { logout } from "@/lib/api/auth"

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authSessionKey, { authenticated: false, user: null })
      queryClient.removeQueries({ queryKey: ["auth"], exact: false })
    },
  })
}
