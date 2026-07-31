from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, JSON

from app.db.database import Base


class QRScan(Base):
    __tablename__ = "qr_scans"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # QR Information
    decoded_text = Column(String, nullable=False)
    qr_type = Column(String, nullable=False)

    # Risk Analysis
    risk_score = Column(Integer, default=0)
    status = Column(String, nullable=False)

    # URL Validation Data
    validation = Column(JSON, nullable=True)

    # AI Analysis Reasons
    reason = Column(JSON, nullable=True)

    # UPI Details (for UPI QR)
    upi_id = Column(String, nullable=True)
    merchant = Column(String, nullable=True)
    amount = Column(String, nullable=True)

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)