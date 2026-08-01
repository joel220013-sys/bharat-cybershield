from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.database import SessionLocal
from app.models.email_scan import EmailScan

router = APIRouter(
    prefix="/email-history",
    tags=["Email History"]
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
# Get All Email History
# Search + Filter
# -------------------------------------------------

@router.get("/")
def get_email_history(
    search: str = Query(default=""),
    status: str = Query(default=""),
    db: Session = Depends(get_db)
):

    query = db.query(EmailScan)

    # -----------------------------
    # Search
    # -----------------------------

    if search:

        query = query.filter(

            or_(

                EmailScan.sender.ilike(f"%{search}%"),

                EmailScan.subject.ilike(f"%{search}%"),

                EmailScan.sender_domain.ilike(f"%{search}%")

            )

        )

    # -----------------------------
    # Status Filter
    # -----------------------------

    if status:

        query = query.filter(
            EmailScan.status == status
        )

    emails = (

        query

        .order_by(
            EmailScan.created_at.desc()
        )

        .all()

    )

    return {

        "total": len(emails),

        "history": emails

    }


# -------------------------------------------------
# Get Single Email
# -------------------------------------------------

@router.get("/{scan_id}")
def get_email(
    scan_id: int,
    db: Session = Depends(get_db)
):

    email = (

        db.query(EmailScan)

        .filter(
            EmailScan.id == scan_id
        )

        .first()

    )

    if email is None:

        raise HTTPException(

            status_code=404,

            detail="Email scan not found"

        )

    return email


# -------------------------------------------------
# Delete One Scan
# -------------------------------------------------

@router.delete("/{scan_id}")
def delete_email(
    scan_id: int,
    db: Session = Depends(get_db)
):

    email = (

        db.query(EmailScan)

        .filter(
            EmailScan.id == scan_id
        )

        .first()

    )

    if email is None:

        raise HTTPException(

            status_code=404,

            detail="Email scan not found"

        )

    db.delete(email)

    db.commit()

    return {

        "success": True,

        "message": "Email scan deleted.",

        "deleted_id": scan_id

    }


# -------------------------------------------------
# Delete All History
# -------------------------------------------------

@router.delete("/")
def delete_all_email_history(

    db: Session = Depends(get_db)

):

    deleted = db.query(EmailScan).delete()

    db.commit()

    return {

        "success": True,

        "deleted": deleted,

        "message": "All email history deleted."

    }


# -------------------------------------------------
# Statistics
# -------------------------------------------------

@router.get("/stats/summary")
def email_summary(

    db: Session = Depends(get_db)

):

    total = db.query(EmailScan).count()

    safe = db.query(EmailScan).filter(
        EmailScan.status == "Safe"
    ).count()

    suspicious = db.query(EmailScan).filter(
        EmailScan.status == "Suspicious"
    ).count()

    danger = db.query(EmailScan).filter(
        EmailScan.status == "Danger"
    ).count()

    return {

        "total": total,

        "safe": safe,

        "suspicious": suspicious,

        "danger": danger

    }