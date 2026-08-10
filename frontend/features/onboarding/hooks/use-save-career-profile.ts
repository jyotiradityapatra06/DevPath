"use client"

import { useMutation } from "@tanstack/react-query"

import { saveCareerProfile } from "@/lib/api/onboarding"

export function useSaveCareerProfile() {
  return useMutation({ mutationFn: saveCareerProfile })
}
