"use client"

import { useMutation } from "@tanstack/react-query"

import { saveCareerGoal } from "@/lib/api/onboarding"

export function useSaveCareerGoal() {
  return useMutation({ mutationFn: saveCareerGoal })
}
