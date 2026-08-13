export interface OnboardingData {
  careerIntent: string
  targetRole: string
  targetRoleId?: number
  experienceLevel: string
  skills: string[]
  skillIds?: number[]
  learningPreference: string
}

export interface ProfilePayload {
  careerIntent?: string
  experienceLevel?: string
  learningPreference?: string
}

export interface CareerGoalPayload {
  targetRole?: string
  targetRoleId?: number
  experienceLevel?: string
  learningPreference?: string
}

export interface SkillSelectionPayload {
  skills?: string[]
  skillIds?: number[]
  experienceLevel: string
}

