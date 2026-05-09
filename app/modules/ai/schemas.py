from pydantic import BaseModel, Field


class AISummaryResult(BaseModel):
    content: str = Field(min_length=1)
    key_points: list[str] = Field(default_factory=list)