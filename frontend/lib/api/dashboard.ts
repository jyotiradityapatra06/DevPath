import type { DashboardOverview } from "@/features/dashboard/types/dashboard"
import { apiClient } from "@/lib/api/client"

interface DashboardApiResponse {
  career_profile: {
    user_name: string
    target_role: string
    experience_level: string
    readiness_score: number
    current_stage: string
    career_goal: string
  }
  skill_overview: {
    total_skills: number
    completed: number
    in_progress: number
    missing: number
  }
  strengths: Array<{ skill: string; level: string }>
  skill_gaps: Array<{ skill: string; priority: string }>
  roadmap_progress: {
    current_phase: number | null
    current_step: string | null
    next_milestone: string | null
    completion_percentage: number
    completed_steps: number
    total_steps: number
  }
  ai_recommendations: string[]
}

const levelScores: Record<string, number> = {
  BEGINNER: 25,
  INTERMEDIATE: 50,
  ADVANCED: 75,
  EXPERT: 100,
}

const priorityScores: Record<string, number> = {
  LOW: 35,
  MEDIUM: 55,
  HIGH: 75,
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { data } = await apiClient.get<DashboardApiResponse>("/api/v1/dashboard")
  const focusArea = data.skill_gaps[0]?.skill ?? data.roadmap_progress.current_step ?? data.career_profile.target_role
  const recommendations = data.ai_recommendations.length > 0
    ? data.ai_recommendations
    : [`Focus on ${focusArea} to improve your readiness for ${data.career_profile.target_role}.`]

  return {
    user: { name: data.career_profile.user_name },
    career: {
      targetRole: data.career_profile.target_role,
      experienceLevel: data.career_profile.experience_level,
      readinessScore: data.career_profile.readiness_score,
      currentStage: data.career_profile.current_stage,
      careerGoal: data.career_profile.career_goal,
    },
    skills: {
      totalSkills: data.skill_overview.total_skills,
      completedSkills: data.skill_overview.completed,
      inProgressSkills: data.skill_overview.in_progress,
      strongSkills: data.strengths.map((item) => ({
        name: item.skill,
        score: levelScores[item.level.toUpperCase()] ?? 50,
      })),
      improvementAreas: data.skill_gaps.map((item) => ({
        name: item.skill,
        score: priorityScores[item.priority.toUpperCase()] ?? 55,
      })),
    },
    roadmap: {
      currentStep: data.roadmap_progress.current_step,
      nextMilestone: data.roadmap_progress.next_milestone,
      progress: data.roadmap_progress.completion_percentage,
      completedSteps: data.roadmap_progress.completed_steps,
      totalSteps: data.roadmap_progress.total_steps,
    },
    aiInsight: { recommendations, focusArea },
  }
}
