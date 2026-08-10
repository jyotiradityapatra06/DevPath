"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

import { generateCareerRoadmap, getCareerRoadmap, MissingCareerProfileError, RoadmapUnavailableError } from "@/lib/api/roadmap"

export const roadmapKey = ["roadmap", "current"] as const

export function useRoadmap() {
  return useQuery({
    queryKey: roadmapKey,
    queryFn: getCareerRoadmap,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof MissingCareerProfileError || error instanceof RoadmapUnavailableError) return false
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      return status !== 401 && failureCount < 2
    },
  })
}

export function useGenerateRoadmap() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: generateCareerRoadmap,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roadmapKey }),
  })
}
