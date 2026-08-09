"""
User model for authentication and access control.
"""

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Enum,
    Index,
)

from app.db.base import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"
    viewer = "viewer"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(128), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.analyst)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self):
        return f"<User {self.username!r} ({self.role.value})>"
