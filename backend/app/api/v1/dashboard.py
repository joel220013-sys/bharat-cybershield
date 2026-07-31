from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.qr_scan import QRScan

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def dashboard(db: Session = Depends(get_db)):

    total_scans = db.query(QRScan).count()

    safe = db.query(QRScan).filter(
        QRScan.status == "Safe"
    ).count()

    suspicious = db.query(QRScan).filter(
        QRScan.status == "Suspicious"
    ).count()

    danger = db.query(QRScan).filter(
        QRScan.status == "Danger"
    ).count()

    url_qr = db.query(QRScan).filter(
        QRScan.qr_type == "URL"
    ).count()

    upi_qr = db.query(QRScan).filter(
        QRScan.qr_type == "UPI"
    ).count()

    average_risk = db.query(
        func.avg(QRScan.risk_score)
    ).scalar()

    if average_risk is None:
        average_risk = 0

    return {
        "total_scans": total_scans,
        "safe": safe,
        "suspicious": suspicious,
        "danger": danger,
        "url_qr": url_qr,
        "upi_qr": upi_qr,
        "average_risk": round(float(average_risk), 2),
    }