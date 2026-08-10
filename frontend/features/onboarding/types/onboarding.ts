export interface OnboardingData {
  careerIntent: string
  targetRole: string
  experienceLevel: string
  skills: string[]
  learningPreference: string
}

export interface ProfilePayload {
  careerIntent?: string
  experienceLevel?: string
  learningPreference?: string
}

export interface CareerGoalPayload {
  targetRole: string
  experienceLevel?: string
  learningPreference?: string
}

export interface SkillSelectionPayload {
  skills: string[]
  experienceLevel: string
}
