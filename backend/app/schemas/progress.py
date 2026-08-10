from datetime import datetime
from typing import Literal

from pydantic import BaseModel


ProgressStatus = Literal["not_started", "in_progress", "completed"]


class ProgressUpdate(BaseModel):
    status: ProgressStatus


class ProgressResponse(BaseModel):
    id: int
    step_id: int
    roadmap_id: int
    step: str
    status: ProgressStatus
    completed_at: datetime | None


class RoadmapProgressResponse(BaseModel):
    roadmap_id: int
    completed_steps: int
    total_steps: int
    completion_percentage: float
