import { BrainCircuit, Cloud, Code2, FlaskConical, Layers3, Server, type LucideIcon } from "lucide-react"

export interface FrontendRoleCard {
  id: number
  canonicalTitle: string
  displayLabel: string
  description?: string
  icon: LucideIcon
}

export const ROLE_PRESENTATION_METADATA: Record<string, { displayLabel: string; icon: LucideIcon }> = {
  "Software Engineer": { displayLabel: "Software Engineer", icon: Code2 },
  "Backend Developer": { displayLabel: "Backend Developer", icon: Server },
  "Full Stack Developer": { displayLabel: "Full Stack Developer", icon: Layers3 },
  "AI Engineer": { displayLabel: "AI/ML Engineer", icon: BrainCircuit },
  "Cloud Engineer": { displayLabel: "Cloud Engineer", icon: Cloud },
  "Data Scientist": { displayLabel: "Data Scientist", icon: FlaskConical },
}

export const DISPLAY_LABEL_TO_CANONICAL: Record<string, string> = {
  "Software Engineer": "Software Engineer",
  "AI/ML Engineer": "AI Engineer",
  "AI Engineer": "AI Engineer",
  "Data Scientist": "Data Scientist",
  "Backend Developer": "Backend Developer",
  "Full Stack Developer": "Full Stack Developer",
  "Cloud Engineer": "Cloud Engineer",
}

export interface BackendRoleItem {
  id: number
  title: string
  description?: string | null
}

export function mapBackendRolesToCards(backendRoles: BackendRoleItem[]): FrontendRoleCard[] {
  const cards: FrontendRoleCard[] = []

  for (const role of backendRoles) {
    const presentation = ROLE_PRESENTATION_METADATA[role.title]
    if (presentation) {
      cards.push({
        id: role.id,
        canonicalTitle: role.title,
        displayLabel: presentation.displayLabel,
        description: role.description ?? undefined,
        icon: presentation.icon,
      })
    } else {
      cards.push({
        id: role.id,
        canonicalTitle: role.title,
        displayLabel: role.title,
        description: role.description ?? undefined,
        icon: Code2,
      })
    }
  }

  return cards
}
