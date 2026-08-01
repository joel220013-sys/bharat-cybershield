from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.sms_scan import SMSScan

router = APIRouter(
    prefix="/sms-history",
    tags=["SMS History"]
)


# ----------------------------------------
# Database
# ----------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------------------------------
# Get SMS History
# ----------------------------------------

@router.get("/")
def get_sms_history(db: Session = Depends(get_db)):

    scans = (
        db.query(SMSScan)
        .order_by(SMSScan.created_at.desc())
        .all()
    )

    return scans


# ----------------------------------------
# Delete SMS Scan
# ----------------------------------------

@router.delete("/{scan_id}")
def delete_sms_scan(
    scan_id: int,
    db: Session = Depends(get_db)
):

    scan = (
        db.query(SMSScan)
        .filter(SMSScan.id == scan_id)
        .first()
    )

    if scan is None:
        raise HTTPException(
            status_code=404,
            detail="SMS scan not found"
        )

    db.delete(scan)
    db.commit()

    return {
        "message": "SMS scan deleted successfully",
        "deleted_id": scan_id
    }