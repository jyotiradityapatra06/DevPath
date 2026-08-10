import type { LearningResource, ProjectMilestone, RoadmapStageData } from "@/features/roadmap/types/roadmap"

export const roadmapStages: RoadmapStageData[] = [
  { id: 1, title: "Foundation", description: "Build dependable engineering fundamentals.", skills: ["Python", "Programming Fundamentals", "Git"], status: "completed", completion: 100, duration: "4 weeks" },
  { id: 2, title: "Backend Engineering", description: "Design production-ready services and data systems.", skills: ["FastAPI", "Databases", "APIs"], status: "current", completion: 58, duration: "6 weeks" },
  { id: 3, title: "Machine Learning", description: "Learn the mechanics behind reliable predictive systems.", skills: ["ML Algorithms", "Model Training", "Evaluation"], status: "upcoming", completion: 0, duration: "8 weeks" },
  { id: 4, title: "AI Systems", description: "Turn models into useful, scalable AI products.", skills: ["LLMs", "RAG", "Deployment"], status: "upcoming", completion: 0, duration: "10 weeks" },
  { id: 5, title: "Career Ready", description: "Convert capability into a compelling hiring signal.", skills: ["Projects", "System Design", "Interview Preparation"], status: "upcoming", completion: 0, duration: "6 weeks" },
]

export const projectMilestones: ProjectMilestone[] = [
  { title: "Build REST API Platform", description: "A secure, documented service with production patterns.", skills: ["FastAPI", "PostgreSQL", "JWT"], difficulty: "Intermediate", state: "in-progress" },
  { title: "Build ML Prediction System", description: "Train, evaluate, and serve a real prediction workflow.", skills: ["Scikit-learn", "Evaluation", "Model serving"], difficulty: "Advanced", state: "planned" },
  { title: "Build AI Assistant", description: "A context-aware assistant grounded in private knowledge.", skills: ["LLMs", "RAG", "Vector search"], difficulty: "Advanced", state: "planned" },
]

export const learningResources: LearningResource[] = [
  { type: "Documentation", description: "Core references selected for your current stage.", count: 8 },
  { type: "Projects", description: "Applied briefs that create portfolio evidence.", count: 3 },
  { type: "Courses", description: "Structured learning for difficult concepts.", count: 5 },
  { type: "Practice", description: "Focused exercises to strengthen recall.", count: 12 },
]
