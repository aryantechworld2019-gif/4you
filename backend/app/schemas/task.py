from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


class TaskBase(BaseModel):
    name: str
    mobile: str = Field(..., min_length=10, max_length=10)
    address: str
    plan: str
    status: Literal["Pending Installation", "Installation Scheduled", "Completed"] = "Pending Installation"


class TaskCreate(TaskBase):
    initial_password: str


class TaskUpdate(BaseModel):
    status: Literal["Pending Installation", "Installation Scheduled", "Completed"]


class TaskResponse(TaskBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
