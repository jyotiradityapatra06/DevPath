import axios from "axios"

import type { AuthUser } from "@/features/auth/types/auth"
import type { CareerGoalPayload, ProfilePayload, SkillSelectionPayload } from "@/features/onboarding/types/onboarding"
import { apiClient } from "@/lib/api/client"

interface RoleRecord { id: number; title: string }
interface SkillRecord { id: number; name: string }
interface UserSkillRecord { skill_id: number }

const roleAliases: Record<string, string> = { "AI/ML Engineer": "AI Engineer" }

export async function saveCareerProfile(payload: ProfilePayload) {
  const body = {
    ...(payload.careerIntent ? { preferred_domain: payload.careerIntent } : {}),
    ...(payload.experienceLevel ? { experience_level: payload.experienceLevel } : {}),
    ...(payload.learningPreference ? { learning_style: payload.learningPreference } : {}),
  }
  try {
    await apiClient.get("/api/v1/profile/me")
    return (await apiClient.put("/api/v1/profile/me", body)).data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return (await apiClient.post("/api/v1/profile", body)).data
    }
    throw error
  }
}

export async function saveCareerGoal(payload: CareerGoalPayload) {
  let targetRoleId = payload.targetRoleId
  if (!targetRoleId) {
    if (!payload.targetRole) throw new Error("Target role is required.")
    const roles = (await apiClient.get<RoleRecord[]>("/api/v1/roles")).data
    const targetTitle = roleAliases[payload.targetRole] ?? payload.targetRole
    const role = roles.find((item) => item.title.toLowerCase() === targetTitle.toLowerCase())
    if (!role) throw new Error(`The ${payload.targetRole} career path is not available yet.`)
    targetRoleId = role.id
  }

  const body = {
    target_role_id: targetRoleId,
    ...(payload.experienceLevel ? { experience_level: payload.experienceLevel } : {}),
    timeline: "6 months",
    ...(payload.learningPreference ? { preferences: payload.learningPreference } : {}),
  }
  try {
    await apiClient.get("/api/v1/career-goals/me")
    return (await apiClient.put("/api/v1/career-goals/me", body)).data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return (await apiClient.post("/api/v1/career-goals", body)).data
    }
    throw error
  }
}

export async function saveSkills(payload: SkillSelectionPayload) {
  const [catalogueResponse, existingResponse] = await Promise.all([
    apiClient.get<SkillRecord[]>("/api/v1/skills"),
    apiClient.get<UserSkillRecord[]>("/api/v1/user-skills"),
  ])
  const catalogue = catalogueResponse.data
  const existing = existingResponse.data
  const existingIds = new Set(existing.map((item) => item.skill_id))
  const level = normalizeLevel(payload.experienceLevel)

  let selectedIds: number[] = []
  if (payload.skillIds && payload.skillIds.length > 0) {
    selectedIds = payload.skillIds
  } else if (payload.skills && payload.skills.length > 0) {
    const byName = new Map(catalogue.map((skill) => [skill.name.toLowerCase(), skill]))
    selectedIds = payload.skills.map((name) => {
      const match = byName.get(name.toLowerCase())
      if (!match) throw new Error(`${name} is not available in the skill catalogue.`)
      return match.id
    })
  }

  const selectedSet = new Set(selectedIds)
  await Promise.all([
    ...selectedIds.map((id) =>
      existingIds.has(id)
        ? apiClient.put(`/api/v1/user-skills/${id}`, { level, status: "IN_PROGRESS" })
        : apiClient.post("/api/v1/user-skills", { skill_id: id, level, status: "IN_PROGRESS" }),
    ),
    ...existing
      .filter((item) => !selectedSet.has(item.skill_id))
      .map((item) => apiClient.delete(`/api/v1/user-skills/${item.skill_id}`)),
  ])
  return selectedIds
}


export async function completeOnboarding() {
  try {
    return (await axios.post<AuthUser>("/api/onboarding/complete", undefined, { withCredentials: true })).data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401 && typeof window !== "undefined") {
      await axios.post("/api/auth/logout").catch(() => undefined)
      window.location.replace("/login?reason=session-expired")
    }
    throw error
  }
}

function normalizeLevel(value: string) {
  const normalized = value.toUpperCase()
  return normalized === "ADVANCED" ? "ADVANCED" : normalized === "INTERMEDIATE" ? "INTERMEDIATE" : "BEGINNER"
}
