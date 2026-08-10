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
  const roles = (await apiClient.get<RoleRecord[]>("/api/v1/roles")).data
  const targetTitle = roleAliases[payload.targetRole] ?? payload.targetRole
  const role = roles.find((item) => item.title.toLowerCase() === targetTitle.toLowerCase())
  if (!role) throw new Error(`The ${payload.targetRole} career path is not available yet.`)
  const body = {
    target_role_id: role.id,
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
  const [catalogue, existing] = await Promise.all([
    apiClient.get<SkillRecord[]>("/api/v1/skills"),
    apiClient.get<UserSkillRecord[]>("/api/v1/user-skills"),
  ])
  const byName = new Map(catalogue.data.map((skill) => [skill.name.toLowerCase(), skill]))
  const existingIds = new Set(existing.data.map((skill) => skill.skill_id))
  const level = normalizeLevel(payload.experienceLevel)
  const selected = payload.skills.map((name) => {
    const skill = byName.get(name.toLowerCase())
    if (!skill) throw new Error(`${name} is not available in the skill catalogue.`)
    return skill
  })
  const selectedIds = new Set(selected.map((skill) => skill.id))
  await Promise.all([
    ...selected.map((skill) => existingIds.has(skill.id)
      ? apiClient.put(`/api/v1/user-skills/${skill.id}`, { level, status: "IN_PROGRESS" })
      : apiClient.post("/api/v1/user-skills", { skill_id: skill.id, level, status: "IN_PROGRESS" })),
    ...existing.data
      .filter((skill) => !selectedIds.has(skill.skill_id))
      .map((skill) => apiClient.delete(`/api/v1/user-skills/${skill.skill_id}`)),
  ])
  return selected
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
