export type SkillState = "strong" | "learning" | "missing"
export type SkillPriority = "HIGH" | "MEDIUM" | "LOW"

export interface SkillNode {
  id: string
  name: string
  category: string
  currentLevel: string
  status: string
  score: number
  state: SkillState
  x: number
  y: number
  level: number
  note: string
}

export interface SkillConnection {
  from: string
  to: string
}

export interface SkillGap {
  name: string
  currentScore: number
  requiredScore: number
  gapPercentage: number
  priority: SkillPriority
  recommendedAction: string
  current: number
  required: number
  action: string
}

export interface LearningRecommendation {
  title: string
  reason: string
  impact: SkillPriority
  estimatedDuration: string
  category: string
  estimate: string
}

export interface SkillSummary {
  totalSkills: number
  strongSkills: number
  improvementAreas: number
  readinessScore: number
  currentLevel: string
}

export interface SkillIntelligence {
  targetRole: string
  summary: SkillSummary
  nodes: SkillNode[]
  connections: SkillConnection[]
  gaps: SkillGap[]
  recommendations: LearningRecommendation[]
}
