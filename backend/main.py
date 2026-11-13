from calendar import monthrange
from datetime import date, datetime, timezone

from fastapi import FastAPI
from pydantic import BaseModel, Field, model_validator

app = FastAPI(title="Death Clock", version="0.1.0")


class Plan(BaseModel):
    birth_date: date
    planning_age: int = Field(ge=1, le=120, strict=True)

    @model_validator(mode="after")
    def validate_dates(self):
        today = datetime.now(timezone.utc).date()
        if self.birth_date > today:
            raise ValueError("Birth date cannot be in the future.")
        if today.year - self.birth_date.year > 120:
            raise ValueError("Birth date must be within the last 120 years.")
        if self.target_date() <= today:
            raise ValueError("Choose a planning age with a birthday in the future.")
        return self

    def target_date(self):
        year = self.birth_date.year + self.planning_age
        day = min(self.birth_date.day, monthrange(year, self.birth_date.month)[1])
        return date(year, self.birth_date.month, day)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/plan")
def create_plan(plan: Plan):
    target = datetime.combine(plan.target_date(), datetime.min.time(), timezone.utc)
    return {"target_date": target.isoformat(), "basis": "user_selected_planning_age"}
