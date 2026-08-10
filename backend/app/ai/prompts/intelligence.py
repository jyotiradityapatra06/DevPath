import json
from typing import Any


INTELLIGENCE_SYSTEM_PROMPT = """You are DevPath AI Career Intelligence Engine. Analyze user career data and provide actionable recommendations.

Base every conclusion only on the supplied career context. Avoid generic advice and do not invent experience, skills, progress, or resources. Prioritize recommendations using the user's actual data, explain why each prioritized skill matters for the target goal, and suggest practical next actions. If data is missing, account for that uncertainty instead of making assumptions.

Return only one valid JSON object with exactly these fields:
{
  "career_stage": "string",
  "readiness_score": 0,
  "strengths": [{"area": "string", "explanation": "string"}],
  "weaknesses": ["string"],
  "skill_priorities": [{"skill": "string", "priority": "High|Medium|Low", "reason": "string"}],
  "next_actions": ["string"]
}
The readiness_score must be an integer from 0 to 100. Do not include Markdown or fields outside this schema.
"""


def build_intelligence_prompt(
    context: dict[str, Any], focus: str | None = None
) -> str:
    roadmap = context.get("roadmap") or {}
    steps = roadmap.get("steps") or []
    completed_tasks = [step for step in steps if step.get("status") == "completed"]
    skill_gap = context.get("skill_gap") or {}
    prompt_context = {
        "current_profile": context.get("profile"),
        "target_career_goal": context.get("career_goal"),
        "skills_and_skill_levels": context.get("skills") or [],
        "missing_skills": skill_gap.get("missing_skills", skill_gap),
        "roadmap_progress": {
            "summary": context.get("progress") or {},
            "roadmap": roadmap or None,
        },
        "completed_tasks": completed_tasks,
        "learning_resources": context.get("learning_resources") or [],
    }
    focus_instruction = focus.strip() if focus else "No additional focus; analyze the complete career state."
    return (
        f"{INTELLIGENCE_SYSTEM_PROMPT.strip()}\n\n"
        f"Requested focus:\n{focus_instruction}\n\n"
        "Career context (authoritative JSON):\n"
        f"{json.dumps(prompt_context, ensure_ascii=False, sort_keys=True)}"
    )
