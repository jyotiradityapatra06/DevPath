"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { BackendRoleItem } from "../config/role-mapping"

export const rolesKey = ["roles"] as const

export function useRoles() {
  return useQuery({
    queryKey: rolesKey,
    queryFn: async () => {
      const response = await apiClient.get<BackendRoleItem[]>("/api/v1/roles")
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
