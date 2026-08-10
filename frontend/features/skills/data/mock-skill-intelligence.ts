import type {
  LearningStep,
  SkillConnection,
  SkillGap,
  SkillNode,
} from "@/features/skills/types/skill-intelligence"

export const skillNodes: SkillNode[] = [
  { id: "python", name: "Python", state: "strong", x: 17, y: 28, level: 92, note: "Core strength" },
  { id: "ml", name: "Machine Learning", state: "learning", x: 43, y: 17, level: 60, note: "Active learning" },
  { id: "fastapi", name: "FastAPI", state: "learning", x: 72, y: 28, level: 40, note: "Growing capability" },
  { id: "sql", name: "SQL", state: "strong", x: 24, y: 68, level: 84, note: "Strong foundation" },
  { id: "docker", name: "Docker", state: "learning", x: 53, y: 56, level: 52, note: "In progress" },
  { id: "cloud", name: "Cloud", state: "missing", x: 82, y: 70, level: 18, note: "Priority gap" },
  { id: "systems", name: "System Design", state: "missing", x: 48, y: 84, level: 24, note: "Future readiness" },
]

export const skillConnections: SkillConnection[] = [
  { from: "python", to: "ml" },
  { from: "python", to: "sql" },
  { from: "ml", to: "fastapi" },
  { from: "ml", to: "docker" },
  { from: "fastapi", to: "docker" },
  { from: "fastapi", to: "cloud" },
  { from: "sql", to: "docker" },
  { from: "docker", to: "cloud" },
  { from: "docker", to: "systems" },
  { from: "cloud", to: "systems" },
]

export const skillGaps: SkillGap[] = [
  {
    name: "Machine Learning",
    priority: "HIGH",
    current: 60,
    required: 90,
    action: "Deepen model evaluation, feature engineering, and neural-network fundamentals.",
  },
  {
    name: "FastAPI",
    priority: "MEDIUM",
    current: 40,
    required: 75,
    action: "Build one production API with testing, authentication, and deployment.",
  },
]

export const learningSteps: LearningStep[] = [
  {
    title: "Master Deep Learning Fundamentals",
    reason: "Required for your AI Engineer target.",
    impact: "HIGH",
    estimate: "3 weeks",
    category: "Machine Learning",
  },
  {
    title: "Ship an ML Inference API",
    reason: "Connect model knowledge with production backend delivery.",
    impact: "HIGH",
    estimate: "2 weeks",
    category: "FastAPI",
  },
  {
    title: "Build Cloud Deployment Fluency",
    reason: "Close the infrastructure gap in your target-role profile.",
    impact: "MEDIUM",
    estimate: "2 weeks",
    category: "Cloud",
  },
]
