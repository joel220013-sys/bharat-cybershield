from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
)
from sqlalchemy.sql import func

from app.db.database import Base


class SMSScan(Base):
    __tablename__ = "sms_scans"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    message = Column(
        Text,
        nullable=False,
    )

    risk_score = Column(
        Integer,
        default=0,
    )

    status = Column(
        String,
        nullable=False,
    )

    reasons = Column(
        Text,
        nullable=True,
    )

    urls = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )