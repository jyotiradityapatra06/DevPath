"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { getSkillIntelligence } from "@/lib/api/skills"

export const skillIntelligenceKey = ["skills", "intelligence"] as const

export function useSkillIntelligence() {
  return useQuery({
    queryKey: skillIntelligenceKey,
    queryFn: getSkillIntelligence,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      return status !== 401 && status !== 404 && failureCount < 2
    },
  })
}
