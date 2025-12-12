from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class UserBase(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=10)
    name: str
    role: Literal["customer", "engineer"] = "customer"


class UserCreate(UserBase):
    password: str
    address: Optional[str] = None
    plan: Optional[str] = None


class UserLogin(BaseModel):
    mobile: str
    password: str
    role: Literal["customer", "engineer"] = "customer"


class UserResponse(UserBase):
    id: str
    address: Optional[str] = None
    plan: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    mobile: Optional[str] = None
    role: Optional[str] = None
