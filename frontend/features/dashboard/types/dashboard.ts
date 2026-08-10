export interface DashboardUser {
  name: string
}

export interface CareerSummary {
  targetRole: string
  experienceLevel: string
  readinessScore: number
  currentStage: string
  careerGoal: string
}

export interface SkillSummaryItem {
  name: string
  score: number
}

export interface SkillSummary {
  totalSkills: number
  strongSkills: SkillSummaryItem[]
  improvementAreas: SkillSummaryItem[]
  completedSkills: number
  inProgressSkills: number
}

export interface RoadmapSummary {
  currentStep: string | null
  nextMilestone: string | null
  progress: number
  completedSteps: number
  totalSteps: number
}

export interface AIInsight {
  recommendations: string[]
  focusArea: string
}

export interface DashboardOverview {
  user: DashboardUser
  career: CareerSummary
  skills: SkillSummary
  roadmap: RoadmapSummary
  aiInsight: AIInsight
}
