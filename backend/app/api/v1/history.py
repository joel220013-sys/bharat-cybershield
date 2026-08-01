import csv
import io
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.qr_scan import QRScan
from app.models.sms_scan import SMSScan

router = APIRouter(
    prefix="/history",
    tags=["History"]
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
# QR Scan History
# -------------------------------------------------

@router.get("/")
def get_history(db: Session = Depends(get_db)):

    scans = (
        db.query(QRScan)
        .order_by(QRScan.created_at.desc())
        .all()
    )

    return scans


# -------------------------------------------------
# Unified History (QR + SMS)
# -------------------------------------------------

@router.get("/all")
def get_all_history(db: Session = Depends(get_db)):

    qr_scans = (
        db.query(QRScan)
        .order_by(QRScan.created_at.desc())
        .all()
    )

    sms_scans = (
        db.query(SMSScan)
        .order_by(SMSScan.created_at.desc())
        .all()
    )

    history = []

    # -----------------------------
    # QR Records
    # -----------------------------

    for scan in qr_scans:

        created = scan.created_at

        if created and created.tzinfo is not None:
            created = created.astimezone(timezone.utc).replace(tzinfo=None)

        history.append({
            "id": scan.id,
            "type": "QR",
            "status": scan.status,
            "risk_score": scan.risk_score,
            "content": scan.decoded_text,
            "created_at": created
        })

    # -----------------------------
    # SMS Records
    # -----------------------------

    for scan in sms_scans:

        created = scan.created_at

        if created and created.tzinfo is not None:
            created = created.astimezone(timezone.utc).replace(tzinfo=None)

        history.append({
            "id": scan.id,
            "type": "SMS",
            "status": scan.status,
            "risk_score": scan.risk_score,
            "content": scan.message,
            "created_at": created
        })

    # -----------------------------
    # Sort Latest First
    # -----------------------------

    history.sort(
        key=lambda x: x["created_at"] or 0,
        reverse=True
    )

    return history


# -------------------------------------------------
# Delete QR Scan
# -------------------------------------------------

@router.delete("/{scan_id}")
def delete_scan(
    scan_id: int,
    db: Session = Depends(get_db)
):

    scan = (
        db.query(QRScan)
        .filter(QRScan.id == scan_id)
        .first()
    )

    if scan is None:
        raise HTTPException(
            status_code=404,
            detail="Scan not found"
        )

    db.delete(scan)
    db.commit()

    return {
        "message": "Scan deleted successfully",
        "deleted_id": scan_id
    }


# -------------------------------------------------
# Export QR History CSV
# -------------------------------------------------

@router.get("/export/csv")
def export_history_csv(
    db: Session = Depends(get_db)
):

    scans = (
        db.query(QRScan)
        .order_by(QRScan.created_at.desc())
        .all()
    )

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "QR Type",
        "Decoded Text",
        "Risk Score",
        "Status",
        "UPI ID",
        "Merchant",
        "Amount",
        "Created At"
    ])

    for scan in scans:

        writer.writerow([
            scan.id,
            scan.qr_type,
            scan.decoded_text,
            scan.risk_score,
            scan.status,
            scan.upi_id,
            scan.merchant,
            scan.amount,
            scan.created_at
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=scan_history.csv"
        }
    )