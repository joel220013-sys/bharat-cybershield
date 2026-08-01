from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import json

from app.ai.sms_detector import analyze_sms

from app.db.database import SessionLocal
from app.models.sms_scan import SMSScan

router = APIRouter(
    prefix="/sms",
    tags=["SMS Scanner"]
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
# Request Model
# ----------------------------------------

class SMSRequest(BaseModel):
    message: str


# ----------------------------------------
# Analyze SMS
# ----------------------------------------

@router.post("/analyze")
async def analyze_sms_api(
    data: SMSRequest,
    db: Session = Depends(get_db)
):

    # AI Analysis
    result = analyze_sms(data.message)

    # ----------------------------------------
    # Save Scan
    # ----------------------------------------

    sms_scan = SMSScan(
        message=data.message,

        risk_score=result["risk_score"],

        status=result["status"],

        reasons=json.dumps(result["reasons"]),

        urls=json.dumps(result["urls"]),
    )

    db.add(sms_scan)
    db.commit()
    db.refresh(sms_scan)

    # ----------------------------------------
    # Response
    # ----------------------------------------

    return {
        "id": sms_scan.id,

        "message": data.message,

        "risk_score": result["risk_score"],

        "status": result["status"],

        "reasons": result["reasons"],

        "urls": result["urls"],

        "validation": result.get("validation"),

        "virustotal": result.get("virustotal"),

        "openphish": result.get("openphish"),

        "created_at": sms_scan.created_at,
    }