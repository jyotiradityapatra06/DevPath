import axios from "axios"

import type { CareerRoadmap, MilestoneDifficulty, MilestoneState, RoadmapResource, RoadmapStage, RoadmapStatus } from "@/features/roadmap/types/roadmap"
import { apiClient } from "@/lib/api/client"

interface CareerGoalResponse { target_role_id: number; target_role: string }
interface RoadmapStepResponse { id: number; skill_id: number | null; skill: string | null; title: string; description: string | null; order: number; week_number: number | null; estimated_hours: number | null }
interface RoadmapResponse { id: number; title: string; role_id: number | null; role: string | null; duration: string | null; steps: RoadmapStepResponse[] }
interface ProgressResponse { step_id: number; status: "not_started" | "in_progress" | "completed" }
interface RoadmapProgressResponse { completion_percentage: number; completed_steps: number; total_steps: number }
interface SkillCatalogueItem { id: number; name: string; difficulty: string | null }
interface SkillResourceResponse { title: string; provider: string; type: string; difficulty: string; rating: number }
interface SkillResourcesResponse { skill: string; resources: SkillResourceResponse[] }

export class MissingCareerProfileError extends Error {
  constructor() { super("Complete your profile to generate your roadmap."); this.name = "MissingCareerProfileError" }
}

export class RoadmapUnavailableError extends Error {
  constructor() { super("Your personalized roadmap is being prepared."); this.name = "RoadmapUnavailableError" }
}

function difficulty(value: string | null): MilestoneDifficulty {
  const normalized = value?.toLowerCase()
  return normalized === "advanced" ? "Advanced" : normalized === "intermediate" ? "Intermediate" : "Beginner"
}

function resourceType(value: string): RoadmapResource["type"] {
  const normalized = value.toLowerCase()
  if (normalized.includes("doc")) return "Documentation"
  if (normalized.includes("project")) return "Projects"
  if (normalized.includes("practice") || normalized.includes("exercise")) return "Practice"
  return "Courses"
}

async function getCareerGoal(): Promise<CareerGoalResponse> {
  try {
    return (await apiClient.get<CareerGoalResponse>("/api/v1/career-goals/me")).data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) throw new MissingCareerProfileError()
    throw error
  }
}

async function loadCurrentRoadmap(): Promise<RoadmapResponse> {
  try {
    return (await apiClient.get<RoadmapResponse>("/api/v1/roadmap/current")).data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      await getCareerGoal()
      throw new RoadmapUnavailableError()
    }
    throw error
  }
}

export async function generateCareerRoadmap(): Promise<void> {
  const goal = await getCareerGoal()
  await apiClient.post("/api/v1/roadmap/generate", { role_id: goal.target_role_id })
}

export async function getCareerRoadmap(): Promise<CareerRoadmap> {
  const roadmap = await loadCurrentRoadmap()
  const [progressItems, progress, catalogue] = await Promise.all([
    apiClient.get<ProgressResponse[]>("/api/v1/progress/me"),
    apiClient.get<RoadmapProgressResponse>(`/api/v1/progress/roadmap/${roadmap.id}`),
    apiClient.get<SkillCatalogueItem[]>("/api/v1/skills"),
  ])
  const progressByStep = new Map(progressItems.data.map((item) => [item.step_id, item.status]))
  const skillById = new Map(catalogue.data.map((item) => [item.id, item]))
  const firstIncomplete = roadmap.steps.findIndex((step) => progressByStep.get(step.id) !== "completed")
  const stages: RoadmapStage[] = roadmap.steps.map((step, index) => {
    const persisted = progressByStep.get(step.id)
    const status: RoadmapStatus = persisted === "completed" ? "completed" : index === firstIncomplete ? "current" : "upcoming"
    const stageProgress = status === "completed" ? 100 : persisted === "in_progress" ? 50 : 0
    return {
      id: index + 1,
      title: step.title,
      description: step.description ?? `Build the capabilities required for ${roadmap.role ?? "your target role"}.`,
      status,
      progress: stageProgress,
      completion: stageProgress,
      duration: step.estimated_hours ? `${step.estimated_hours} hours` : step.week_number ? `Week ${step.week_number}` : "Self-paced",
      skills: step.skill ? [step.skill] : [],
    }
  })
  const milestones = roadmap.steps.map((step, index) => {
    const stage = stages[index]
    const state: MilestoneState = stage.status === "completed" ? "completed" : stage.status === "current" ? "in-progress" : "planned"
    const skills = step.skill ? [step.skill] : []
    return {
      title: step.title,
      description: step.description ?? `Complete this milestone for ${roadmap.role ?? "your target role"}.`,
      difficulty: difficulty(step.skill_id ? skillById.get(step.skill_id)?.difficulty ?? null : null),
      status: state,
      state,
      skillsGained: skills,
      skills,
    }
  })
  const currentIndex = firstIncomplete >= 0 ? firstIncomplete : Math.max(roadmap.steps.length - 1, 0)
  const currentStep = roadmap.steps[currentIndex]
  const resourceResponses = await Promise.all(
    roadmap.steps
      .filter((step): step is RoadmapStepResponse & { skill_id: number } => step.skill_id !== null)
      .map((step) => apiClient.get<SkillResourcesResponse>(`/api/v1/skills/${step.skill_id}/resources`)),
  )
  const resources: RoadmapResource[] = resourceResponses.flatMap((response) => response.data.resources.map((item) => ({
    title: item.title,
    type: resourceType(item.type),
    description: `${item.provider} · ${item.difficulty} · ${response.data.skill}`,
    provider: item.provider,
    difficulty: item.difficulty,
    rating: item.rating,
  })))

  return {
    id: roadmap.id,
    targetRole: roadmap.role ?? "Target role",
    estimatedDuration: roadmap.duration ?? "Self-paced",
    currentStage: stages.length ? `Stage ${currentIndex + 1} of ${stages.length}` : "Preparing stages",
    completionPercentage: progress.data.completion_percentage,
    stages,
    milestones,
    currentFocus: {
      nextRecommendedAction: currentStep?.title ?? `Review your ${roadmap.role ?? "career"} goal`,
      reason: currentStep?.description ?? "Your roadmap steps are being prepared.",
      priority: firstIncomplete >= 0 ? "HIGH" : "LOW",
      estimatedDuration: currentStep?.estimated_hours ? `${currentStep.estimated_hours} hours` : "Self-paced",
    },
    resources,
  }
}
