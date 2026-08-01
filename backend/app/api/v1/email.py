import os
import shutil
import tempfile

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.email_scan import EmailScan

from app.ai.email_parser import parse_email_file
from app.ai.email_detector import analyze_email

from app.ai.url_validator import validate_url
from app.ai.safe_browsing import check_url
from app.ai.virustotal import check_url_virustotal
from app.ai.openphish import check_openphish
from app.ai.domain_reputation import check_domain_reputation

router = APIRouter(
    prefix="/email",
    tags=["Email Scanner"]
)


# -------------------------------------------------
# Database
# -------------------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------------------------
# Organization Detector
# -------------------------------------------------

def detect_organization(domain: str):

    if not domain:
        return "Unknown"

    domain = domain.lower()

    mapping = {

        "famapp.in": "FamApp",

        "phonepe.com": "PhonePe",

        "paytm.com": "Paytm",

        "google.com": "Google",

        "gmail.com": "Google",

        "microsoft.com": "Microsoft",

        "outlook.com": "Microsoft",

        "amazon.in": "Amazon",

        "amazon.com": "Amazon",

        "hdfcbank.com": "HDFC Bank",

        "icicibank.com": "ICICI Bank",

        "axisbank.com": "Axis Bank",

        "onlinesbi.sbi": "State Bank of India",

        "kotak.com": "Kotak Bank",

        "gov.in": "Government of India",

        "nic.in": "Government of India"

    }

    for key, value in mapping.items():

        if domain.endswith(key):

            return value

    return domain


# -------------------------------------------------
# Trust Level
# -------------------------------------------------

def trust_level(score):

    if score <= 20:
        return "Verified"

    if score <= 50:
        return "Medium"

    return "Low"


# -------------------------------------------------
# Analyze Email
# -------------------------------------------------

@router.post("/analyze")
async def analyze_email_api(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    allowed = [".pdf", ".txt", ".eml"]

    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in allowed:

        raise HTTPException(
            status_code=400,
            detail="Supported files: PDF, TXT and EML"
        )

    temp_dir = tempfile.mkdtemp()

    temp_path = os.path.join(
        temp_dir,
        file.filename
    )

    with open(temp_path, "wb") as buffer:

        shutil.copyfileobj(file.file, buffer)

    # -----------------------------------------
    # Parse Email
    # -----------------------------------------

    email_data = parse_email_file(temp_path)

    result = analyze_email(

        email_data["subject"],

        email_data["sender"],

        email_data["body"]

    )

    validation = None

    domain = {
        "score": 0,
        "creation_date": None,
        "expiration_date": None,
        "reasons": []
    }

    virustotal = {
        "score": 0,
        "status": "N/A",
        "malicious": 0,
        "suspicious": 0,
        "harmless": 0,
        "reason": ""
    }

    openphish = {
        "score": 0,
        "status": "N/A",
        "reason": ""
    }

    safe_browsing = {
        "unsafe": False,
        "message": ""
    }

    if result["urls"]:

        url = result["urls"][0]

        validation = validate_url(url)

        domain = check_domain_reputation(url)

        virustotal = check_url_virustotal(url)

        openphish = check_openphish(url)

        unsafe, message = check_url(url)

        safe_browsing = {

            "unsafe": unsafe,

            "message": message

        }

    # -----------------------------------------
    # Save Scan
    # -----------------------------------------

    scan = EmailScan(

        sender=email_data.get("sender", ""),

        subject=email_data.get("subject", ""),

        body=email_data.get("body", ""),

        sender_domain=result["sender_domain"],

        risk_score=result["risk_score"],

        status=result["status"],

        urls=", ".join(result["urls"]),

        reasons=", ".join(result["reasons"])

    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    os.remove(temp_path)
    os.rmdir(temp_dir)

    # -----------------------------------------
    # Professional Summary
    # -----------------------------------------

    organization = detect_organization(result["sender_domain"])

    trust = trust_level(result["risk_score"])

    confidence = max(60, 100 - result["risk_score"])

    if result["status"] == "Safe":

        ai_summary = (
            "This email appears legitimate. "
            "The sender belongs to a trusted organization and "
            "no major phishing indicators were detected."
        )

    elif result["status"] == "Suspicious":

        ai_summary = (
            "Some suspicious indicators were detected. "
            "Verify the sender and avoid clicking unknown links."
        )

    else:

        ai_summary = (
            "This email contains multiple phishing indicators. "
            "Do not click links or share sensitive information."
        )

    # -----------------------------------------
    # Response
    # -----------------------------------------

    return {

        "id": scan.id,

        "filename": file.filename,

        "organization": organization,

        "sender": scan.sender,

        "receiver": email_data.get("receiver", ""),

        "subject": scan.subject,

        "sender_domain": scan.sender_domain,

        "trust_level": trust,

        "confidence": confidence,

        "risk_score": scan.risk_score,

        "status": scan.status,

        "summary": ai_summary,

        "urls": result["urls"],

        "phones": result["phones"],

        "upi_ids": result["upi_ids"],

        "banks": result["banks"],

        "reasons": result["reasons"],

        "validation": validation,

        "domain_reputation": domain,

        "virustotal": virustotal,

        "openphish": openphish,

        "safe_browsing": safe_browsing,

        "created_at": scan.created_at

    }