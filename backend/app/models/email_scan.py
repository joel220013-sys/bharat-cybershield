from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime
)
from sqlalchemy.sql import func

from app.db.database import Base


class EmailScan(Base):
    __tablename__ = "email_scans"

    # -------------------------------------------------
    # Primary Key
    # -------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # -------------------------------------------------
    # Email Information
    # -------------------------------------------------

    sender = Column(
        String(255),
        nullable=False
    )

    subject = Column(
        String(500),
        nullable=False
    )

    body = Column(
        Text,
        nullable=False
    )

    sender_domain = Column(
        String(255),
        nullable=True
    )

    # -------------------------------------------------
    # AI Analysis
    # -------------------------------------------------

    risk_score = Column(
        Integer,
        default=0
    )

    status = Column(
        String(50),
        default="Safe"
    )

    urls = Column(
        Text,
        nullable=True
    )

    reasons = Column(
        Text,
        nullable=True
    )

    # -------------------------------------------------
    # Timestamp
    # -------------------------------------------------

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # -------------------------------------------------
    # String Representation
    # -------------------------------------------------

    def __repr__(self):
        return (
            f"<EmailScan("
            f"id={self.id}, "
            f"sender='{self.sender}', "
            f"status='{self.status}', "
            f"risk_score={self.risk_score})>"
        )