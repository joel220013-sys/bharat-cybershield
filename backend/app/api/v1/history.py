import csv
import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.qr_scan import QRScan

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
# Get Scan History
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
# Delete Scan
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
# Export History CSV
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
            "Content-Disposition":
            "attachment; filename=scan_history.csv"
        }
    )