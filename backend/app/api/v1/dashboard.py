from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.email_scan import EmailScan
from app.models.qr_scan import QRScan
from app.models.sms_scan import SMSScan

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# -------------------------------------------------
# Database Dependency
# -------------------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------------------------
# Dashboard
# -------------------------------------------------

@router.get("/")
def dashboard(db: Session = Depends(get_db)):

    # -----------------------------------------
    # QR Statistics
    # -----------------------------------------

    qr_scans = db.query(QRScan).count()

    qr_safe = db.query(QRScan).filter(
        QRScan.status == "Safe"
    ).count()

    qr_suspicious = db.query(QRScan).filter(
        QRScan.status == "Suspicious"
    ).count()

    qr_danger = db.query(QRScan).filter(
        QRScan.status == "Danger"
    ).count()

    url_qr = db.query(QRScan).filter(
        QRScan.qr_type == "URL"
    ).count()

    upi_qr = db.query(QRScan).filter(
        QRScan.qr_type == "UPI"
    ).count()

    qr_avg = db.query(
        func.avg(QRScan.risk_score)
    ).scalar()

    if qr_avg is None:
        qr_avg = 0

    # -----------------------------------------
    # SMS Statistics
    # -----------------------------------------

    sms_scans = db.query(SMSScan).count()

    sms_safe = db.query(SMSScan).filter(
        SMSScan.status == "Safe"
    ).count()

    sms_suspicious = db.query(SMSScan).filter(
        SMSScan.status == "Suspicious"
    ).count()

    sms_danger = db.query(SMSScan).filter(
        SMSScan.status == "Danger"
    ).count()

    sms_avg = db.query(
        func.avg(SMSScan.risk_score)
    ).scalar()

    if sms_avg is None:
        sms_avg = 0

    # -----------------------------------------
    # Email Statistics
    # -----------------------------------------

    email_scans = db.query(EmailScan).count()

    email_safe = db.query(EmailScan).filter(
        EmailScan.status == "Safe"
    ).count()

    email_suspicious = db.query(EmailScan).filter(
        EmailScan.status == "Suspicious"
    ).count()

    email_danger = db.query(EmailScan).filter(
        EmailScan.status == "Danger"
    ).count()

    email_avg = db.query(
        func.avg(EmailScan.risk_score)
    ).scalar()

    if email_avg is None:
        email_avg = 0

    # -----------------------------------------
    # Overall Statistics
    # -----------------------------------------

    total_scans = qr_scans + sms_scans + email_scans

    safe = qr_safe + sms_safe + email_safe

    suspicious = (
        qr_suspicious +
        sms_suspicious +
        email_suspicious
    )

    danger = qr_danger + sms_danger + email_danger

    if total_scans == 0:
        average_risk = 0
    else:
        average_risk = round(
            (
                (qr_avg * qr_scans) +
                (sms_avg * sms_scans) +
                (email_avg * email_scans)
            ) / total_scans,
            2
        )

    # -----------------------------------------
    # Recent Activity
    # -----------------------------------------

    recent_qr = (
        db.query(QRScan)
        .order_by(QRScan.created_at.desc())
        .limit(5)
        .all()
    )

    recent_sms = (
        db.query(SMSScan)
        .order_by(SMSScan.created_at.desc())
        .limit(5)
        .all()
    )

    recent_email = (
        db.query(EmailScan)
        .order_by(EmailScan.created_at.desc())
        .limit(5)
        .all()
    )

    recent_scans = []

    for scan in recent_qr:

        recent_scans.append({
            "id": scan.id,
            "type": "QR",
            "status": scan.status,
            "risk_score": scan.risk_score,
            "content": scan.decoded_text,
            "created_at": scan.created_at
        })

    for scan in recent_sms:

        recent_scans.append({
            "id": scan.id,
            "type": "SMS",
            "status": scan.status,
            "risk_score": scan.risk_score,
            "content": scan.message,
            "created_at": scan.created_at
        })

    for scan in recent_email:

        recent_scans.append({
            "id": scan.id,
            "type": "Email",
            "status": scan.status,
            "risk_score": scan.risk_score,
            "content": scan.subject,
            "created_at": scan.created_at
        })

    recent_scans.sort(
        key=lambda x: str(x["created_at"]),
        reverse=True
    )

    recent_scans = recent_scans[:10]

    # -----------------------------------------
    # Response
    # -----------------------------------------

    return {

        # Overall Statistics
        "total_scans": total_scans,
        "average_risk": average_risk,

        # Scan Counts
        "qr_scans": qr_scans,
        "sms_scans": sms_scans,
        "email_scans": email_scans,

        # Status Counts
        "safe": safe,
        "suspicious": suspicious,
        "danger": danger,

        # QR Statistics
        "url_qr": url_qr,
        "upi_qr": upi_qr,

        # Recent Activity
        "recent_scans": recent_scans

    }