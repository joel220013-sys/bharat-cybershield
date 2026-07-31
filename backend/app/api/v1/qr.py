import os
import shutil

from fastapi import APIRouter, UploadFile, File, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.ai.qr_detector import read_qr, analyze_qr
from app.ai.url_validator import validate_url
from app.ai.risk_engine import calculate_risk
from app.ai.safe_browsing import check_url

# AI Modules
from app.ai.ocr import extract_text
from app.ai.scam_detector import analyze_text
from app.ai.brand_verifier import verify_brand
from app.ai.domain_reputation import check_domain_reputation
from app.ai.virustotal import check_url_virustotal
from app.ai.openphish import check_openphish

from app.models.qr_scan import QRScan
from app.schemas.qr_scan import QRScanResponse

router = APIRouter(
    prefix="/qr",
    tags=["QR Scanner"]
)

UPLOAD_FOLDER = "app/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


class QRTextRequest(BaseModel):
    text: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/scan", response_model=QRScanResponse)
async def scan_qr(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # ---------------------------------------------------
    # Save Uploaded Image
    # ---------------------------------------------------

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ---------------------------------------------------
    # OCR + Scam Detection
    # ---------------------------------------------------

    try:

        ocr_result = extract_text(file_path)
        text_analysis = analyze_text(ocr_result["text"])

        print("\n========== OCR ==========")
        print(ocr_result)

        print("\n====== SCAM ANALYSIS ======")
        print(text_analysis)

    except Exception as e:

        print("OCR Error:", e)

        ocr_result = {
            "text": "",
            "lines": []
        }

        text_analysis = {
            "score": 0,
            "status": "Safe",
            "reasons": []
        }

    # ---------------------------------------------------
    # Decode QR
    # ---------------------------------------------------

    decoded = read_qr(file_path)

    if decoded is None:

        return {
            "decoded_text": "No QR Found",
            "qr_type": "Unknown",
            "risk_score": 100,
            "status": "Invalid",
            "upi_id": None,
            "merchant": None,
            "amount": None,
            "validation": None,
            "reason": ["No QR Code detected"]
        }

    # ---------------------------------------------------
    # Analyze QR
    # ---------------------------------------------------

    result = analyze_qr(decoded)
    print("=" * 50)
    print("QR TYPE:", result["qr_type"])
    print("DECODED URL:", result["decoded_text"])
    print("=" * 50)

    validation = None

    if result["qr_type"] == "URL":
        validation = validate_url(result["decoded_text"])
        result["validation"] = validation

    # ---------------------------------------------------
    # Brand Verification
    # ---------------------------------------------------

    brand_analysis = {
        "score": 0,
        "matched_brand": None,
        "reason": "No known brand detected"
    }

    if result["qr_type"] == "URL":

        brand_analysis = verify_brand(
            ocr_result["text"],
            result["decoded_text"]
        )

        print("\n====== BRAND VERIFICATION ======")
        print(brand_analysis)

    # ---------------------------------------------------
    # Domain Reputation
    # ---------------------------------------------------

    domain_analysis = {
        "score": 0,
        "creation_date": None,
        "expiration_date": None,
        "reasons": []
    }

    if result["qr_type"] == "URL":

        domain_analysis = check_domain_reputation(
            result["decoded_text"]
        )

        print("\n====== DOMAIN REPUTATION ======")
        print(domain_analysis)

    # ---------------------------------------------------
    # VirusTotal
    # ---------------------------------------------------

    virustotal_analysis = {
        "score": 0,
        "status": "Unavailable",
        "malicious": 0,
        "suspicious": 0,
        "harmless": 0,
        "reason": ""
    }

    if result["qr_type"] == "URL":

        virustotal_analysis = check_url_virustotal(
            result["decoded_text"]
        )

        print("\n====== VIRUSTOTAL ======")
        print(virustotal_analysis)

    # ---------------------------------------------------
    # OpenPhish
    # ---------------------------------------------------

    openphish_analysis = {
        "score": 0,
        "status": "Safe",
        "reason": ""
    }

    if result["qr_type"] == "URL":

        openphish_analysis = check_openphish(
            result["decoded_text"]
        )

        print("\n====== OPENPHISH ======")
        print(openphish_analysis)

    # ---------------------------------------------------
    # Local Risk Engine
    # ---------------------------------------------------

    score, status, reasons = calculate_risk(result)

    if validation:

        if not validation.get("https", False):
            score += 10
            reasons.append("Website is not using HTTPS")

        if validation.get("shortener", False):
            score += 20
            reasons.append("URL Shortener Detected")

        if validation.get("ip_address", False):
            score += 30
            reasons.append("Uses IP Address")

        if validation.get("subdomain_count", 0) > 3:
            score += 10
            reasons.append("Too many subdomains")

        if validation.get("suspicious_keywords"):
            score += 10
            reasons.append(
                "Suspicious keywords: "
                + ", ".join(validation["suspicious_keywords"])
            )

        score = min(score, 100)

    # ---------------------------------------------------
    # Google Safe Browsing
    # ---------------------------------------------------

    if result["qr_type"] == "URL":

        unsafe, message = check_url(result["decoded_text"])

        if unsafe:

            score = max(score, 95)
            status = "Danger"

            if "Flagged by Google Safe Browsing" not in reasons:
                reasons.append("Flagged by Google Safe Browsing")

        elif message:

            if message not in reasons:
                reasons.append(message)

    # ---------------------------------------------------
    # Merge OCR Score
    # ---------------------------------------------------

    score = min(score + text_analysis["score"], 100)

    for reason in text_analysis["reasons"]:
        if reason not in reasons:
            reasons.append(reason)

    # ---------------------------------------------------
    # Merge Brand Score
    # ---------------------------------------------------

    score = min(score + brand_analysis["score"], 100)

    if (
        brand_analysis["reason"]
        and brand_analysis["reason"] not in reasons
    ):
        reasons.append(brand_analysis["reason"])

    # ---------------------------------------------------
    # Merge Domain Reputation Score
    # ---------------------------------------------------

    score = min(score + domain_analysis["score"], 100)

    for reason in domain_analysis["reasons"]:
        if reason not in reasons:
            reasons.append(reason)

    # ---------------------------------------------------
    # Merge VirusTotal Score
    # ---------------------------------------------------

    score = min(score + virustotal_analysis["score"], 100)

    if (
        virustotal_analysis["reason"]
        and virustotal_analysis["reason"] not in reasons
    ):
        reasons.append(virustotal_analysis["reason"])

    # ---------------------------------------------------
    # Merge OpenPhish Score
    # ---------------------------------------------------

    score = min(score + openphish_analysis["score"], 100)

    if (
        openphish_analysis["reason"]
        and openphish_analysis["reason"] not in reasons
    ):
        reasons.append(openphish_analysis["reason"])

    # ---------------------------------------------------
    # Final Status
    # ---------------------------------------------------

    if score >= 80:
        status = "Danger"

    elif score >= 50:
        status = "Suspicious"

    else:
        status = "Safe"

    # ---------------------------------------------------
    # Final Result
    # ---------------------------------------------------

    result["risk_score"] = score
    result["status"] = status
    result["validation"] = validation
    result["reason"] = reasons

    # New AI results
    result["ocr_text"] = ocr_result["text"]
    result["brand_verification"] = brand_analysis
    result["domain_reputation"] = domain_analysis
    result["virustotal"] = virustotal_analysis
    result["openphish"] = openphish_analysis

    # ---------------------------------------------------
    # Save Scan History
    # ---------------------------------------------------

    scan = QRScan(
        decoded_text=result["decoded_text"],
        qr_type=result["qr_type"],
        risk_score=score,
        status=status,
        validation=validation,
        reason=reasons,
        upi_id=result.get("upi_id"),
        merchant=result.get("merchant"),
        amount=result.get("amount"),
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    return result


# ---------------------------------------------------
# Live Camera QR Scan
# ---------------------------------------------------

@router.post("/scan-text")
async def scan_qr_text(
    request: QRTextRequest,
    db: Session = Depends(get_db)
):
    decoded = request.text

    # -----------------------------
    # Analyze QR
    # -----------------------------
    result = analyze_qr(decoded)

    validation = None

    if result["qr_type"] == "URL":
        validation = validate_url(result["decoded_text"])
        result["validation"] = validation

    # -----------------------------
    # Local Risk Engine
    # -----------------------------
    score, status, reasons = calculate_risk(result)

    if validation:

        if not validation.get("https", False):
            score += 10
            reasons.append("Website is not using HTTPS")

        if validation.get("shortener", False):
            score += 20
            reasons.append("URL Shortener Detected")

        if validation.get("ip_address", False):
            score += 30
            reasons.append("Uses IP Address")

        if validation.get("subdomain_count", 0) > 3:
            score += 10
            reasons.append("Too many subdomains")

        if validation.get("suspicious_keywords"):
            score += 10
            reasons.append(
                "Suspicious keywords: " +
                ", ".join(validation["suspicious_keywords"])
            )

        score = min(score, 100)

    # -----------------------------
    # Google Safe Browsing
    # -----------------------------
    if result["qr_type"] == "URL":

        unsafe, message = check_url(result["decoded_text"])

        if unsafe:
            score = max(score, 95)
            status = "Danger"

            if "Flagged by Google Safe Browsing" not in reasons:
                reasons.append("Flagged by Google Safe Browsing")

        elif message and message not in reasons:
            reasons.append(message)

    # -----------------------------
    # Final Status
    # -----------------------------
    if score >= 80:
        status = "Danger"
    elif score >= 50:
        status = "Suspicious"
    else:
        status = "Safe"

    result["risk_score"] = score
    result["status"] = status
    result["validation"] = validation
    result["reason"] = reasons

    # -----------------------------
    # Save History
    # -----------------------------
    scan = QRScan(
        decoded_text=result["decoded_text"],
        qr_type=result["qr_type"],
        risk_score=score,
        status=status,
        validation=validation,
        reason=reasons,
        upi_id=result.get("upi_id"),
        merchant=result.get("merchant"),
        amount=result.get("amount"),
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    return result