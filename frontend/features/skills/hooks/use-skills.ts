"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"

export interface BackendSkillItem {
  id: number
  name: string
  category: string
  difficulty: string | null
}

export interface UserSkillItem {
  skill_id: number
  skill?: string
  level: string
  status: string
}

export const skillsCatalogueKey = ["skills", "catalogue"] as const
export const userSkillsKey = ["user-skills"] as const

export function useSkillsCatalogue() {
  return useQuery({
    queryKey: skillsCatalogueKey,
    queryFn: async () => {
      const response = await apiClient.get<BackendSkillItem[]>("/api/v1/skills")
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUserSkills() {
  return useQuery({
    queryKey: userSkillsKey,
    queryFn: async () => {
      const response = await apiClient.get<UserSkillItem[]>("/api/v1/user-skills")
      return response.data
    },
    staleTime: 60 * 1000,
  })
}
