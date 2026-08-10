import axios from "axios"

import type { LearningRecommendation, SkillConnection, SkillGap, SkillIntelligence, SkillNode, SkillPriority, SkillState } from "@/features/skills/types/skill-intelligence"
import { apiClient } from "@/lib/api/client"

interface CareerGoalResponse { target_role_id: number; target_role: string; experience_level: string | null }
interface UserSkillResponse { skill_id: number; skill: string; level: string; status: string }
interface RequiredSkillResponse { name: string; importance: number; difficulty: string | null }
interface RoleSkillsResponse { role: string; skills: RequiredSkillResponse[] }
interface SkillCatalogueItem { id: number; name: string; category: string; difficulty: string | null }
interface MissingSkillResponse { id: number; name: string; importance: number; difficulty: string | null; priority_score: number; priority: string }
interface SkillGapResponse { role: string; overall_score: number; missing_skills: MissingSkillResponse[] }
interface RecommendationResponse { title: string; description: string; reason: string; priority_score: number; priority_level: SkillPriority }

const levelScores: Record<string, number> = { BEGINNER: 25, INTERMEDIATE: 50, ADVANCED: 75, EXPERT: 100 }
const requiredScores: Record<string, number> = { BEGINNER: 50, INTERMEDIATE: 75, ADVANCED: 100, EXPERT: 100 }

function priority(value: string): SkillPriority {
  const normalized = value.toUpperCase()
  return normalized === "HIGH" ? "HIGH" : normalized === "LOW" ? "LOW" : "MEDIUM"
}

function skillId(name: string, index: number) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "skill"}-${index}`
}

function graphPosition(index: number, total: number) {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / Math.max(total, 1)
  return { x: Math.round(50 + Math.cos(angle) * 35), y: Math.round(50 + Math.sin(angle) * 34) }
}

async function getOrCreateGap(roleId: number): Promise<SkillGapResponse> {
  try {
    return (await apiClient.get<SkillGapResponse>("/api/v1/skill-gap/latest")).data
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error
    return (await apiClient.post<SkillGapResponse>("/api/v1/skill-gap/analyze", { role_id: roleId })).data
  }
}

export async function getSkillIntelligence(): Promise<SkillIntelligence> {
  const goal = (await apiClient.get<CareerGoalResponse>("/api/v1/career-goals/me")).data
  const [userSkillsResponse, roleSkillsResponse, catalogueResponse, gap, recommendationResponse] = await Promise.all([
    apiClient.get<UserSkillResponse[]>("/api/v1/user-skills"),
    apiClient.get<RoleSkillsResponse>(`/api/v1/roles/${goal.target_role_id}/skills`),
    apiClient.get<SkillCatalogueItem[]>("/api/v1/skills"),
    getOrCreateGap(goal.target_role_id),
    apiClient.get<RecommendationResponse[]>("/api/v1/personalization/recommendations"),
  ])
  const userSkills = new Map(userSkillsResponse.data.map((item) => [item.skill.toLowerCase(), item]))
  const catalogue = new Map(catalogueResponse.data.map((item) => [item.name.toLowerCase(), item]))
  const recommendationsBySkill = new Map(recommendationResponse.data.map((item) => {
    const match = roleSkillsResponse.data.skills.find((skill) => item.title.toLowerCase().includes(skill.name.toLowerCase()))
    return [match?.name.toLowerCase() ?? item.title.toLowerCase(), item]
  }))
  const nodes: SkillNode[] = roleSkillsResponse.data.skills.map((required, index, all) => {
    const userSkill = userSkills.get(required.name.toLowerCase())
    const score = userSkill ? levelScores[userSkill.level.toUpperCase()] ?? 25 : 0
    const requiredScore = requiredScores[(required.difficulty ?? "BEGINNER").toUpperCase()] ?? 50
    const state: SkillState = score >= requiredScore && ["COMPLETED", "MASTERED"].includes(userSkill?.status.toUpperCase() ?? "") ? "strong" : userSkill ? "learning" : "missing"
    return {
      id: skillId(required.name, index),
      name: required.name,
      category: catalogue.get(required.name.toLowerCase())?.category ?? "Career skill",
      currentLevel: userSkill?.level ?? "NOT_STARTED",
      status: userSkill?.status ?? "NOT_STARTED",
      score,
      state,
      ...graphPosition(index, all.length),
      level: score,
      note: state === "strong" ? "Target level achieved" : state === "learning" ? `${userSkill?.level.toLowerCase()} · ${userSkill?.status.toLowerCase().replaceAll("_", " ")}` : "Priority skill gap",
    }
  })
  const connections: SkillConnection[] = nodes.slice(1).map((node, index) => ({ from: nodes[index].id, to: node.id }))
  const gaps: SkillGap[] = gap.missing_skills.map((item) => {
    const userSkill = userSkills.get(item.name.toLowerCase())
    const currentScore = userSkill ? levelScores[userSkill.level.toUpperCase()] ?? 25 : 0
    const requiredScore = requiredScores[(item.difficulty ?? "BEGINNER").toUpperCase()] ?? 50
    const recommendation = recommendationsBySkill.get(item.name.toLowerCase())
    const recommendedAction = recommendation?.description ?? `Build ${item.name} to the ${item.difficulty?.toLowerCase() ?? "foundational"} level required for ${goal.target_role}.`
    return { name: item.name, currentScore, requiredScore, gapPercentage: Math.max(requiredScore - currentScore, 0), priority: priority(item.priority), recommendedAction, current: currentScore, required: requiredScore, action: recommendedAction }
  })
  const recommendations: LearningRecommendation[] = (recommendationResponse.data.length > 0
    ? recommendationResponse.data
    : gaps.map((item) => ({ title: `Learn ${item.name}`, description: item.recommendedAction, reason: `${item.name} is required for ${goal.target_role}.`, priority_score: item.gapPercentage, priority_level: item.priority })))
    .slice(0, 5)
    .map((item) => {
      const matchedSkill = roleSkillsResponse.data.skills.find((skill) => item.title.toLowerCase().includes(skill.name.toLowerCase()))
      const estimatedDuration = item.priority_level === "HIGH" ? "3 weeks" : item.priority_level === "MEDIUM" ? "2 weeks" : "1 week"
      return { title: item.title, reason: item.reason, impact: item.priority_level, estimatedDuration, estimate: estimatedDuration, category: matchedSkill?.name ?? "Career growth" }
    })

  return {
    targetRole: gap.role,
    summary: {
      totalSkills: nodes.length,
      strongSkills: nodes.filter((item) => item.state === "strong").length,
      improvementAreas: gaps.length,
      readinessScore: gap.overall_score,
      currentLevel: goal.experience_level ?? "Not specified",
    },
    nodes,
    connections,
    gaps,
    recommendations,
  }
}
