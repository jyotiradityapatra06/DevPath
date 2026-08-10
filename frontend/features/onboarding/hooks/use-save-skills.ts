"use client"

import { useMutation } from "@tanstack/react-query"

import { saveSkills } from "@/lib/api/onboarding"

export function useSaveSkills() {
  return useMutation({ mutationFn: saveSkills })
}
