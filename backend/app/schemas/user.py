"""Pydantic schemas for User API validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=128)
    full_name: Optional[str] = None
    role: UserRole = UserRole.analyst


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
