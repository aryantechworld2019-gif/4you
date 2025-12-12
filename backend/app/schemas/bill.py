from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


class BillBase(BaseModel):
    month: str
    amount: float
    due_date: str
    status: Literal["Paid", "Overdue", "Due"] = "Due"


class BillCreate(BillBase):
    user_id: str


class BillUpdate(BaseModel):
    status: Optional[Literal["Paid", "Overdue", "Due"]] = None


class BillResponse(BillBase):
    id: str
    user_id: str
    pdf_filename: str
    created_at: datetime

    class Config:
        from_attributes = True
