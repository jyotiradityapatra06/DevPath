"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"

import { getCoachConversation, sendCoachMessage } from "@/lib/api/coach"

export const coachConversationKey = ["coach", "conversation"] as const

export function useCoachConversation() {
  return useQuery({
    queryKey: coachConversationKey,
    queryFn: getCoachConversation,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      return status !== 401 && failureCount < 2
    },
  })
}

export function useSendCoachMessage() {
  return useMutation({
    mutationFn: sendCoachMessage,
  })
}
