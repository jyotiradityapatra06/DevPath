"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { getDashboardOverview } from "@/lib/api/dashboard"

export const dashboardOverviewKey = ["dashboard", "overview"] as const

export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardOverviewKey,
    queryFn: getDashboardOverview,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      return status !== 401 && status !== 404 && failureCount < 2
    },
  })
}
