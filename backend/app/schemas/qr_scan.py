from typing import Optional, List, Dict, Any

from pydantic import BaseModel


class QRScanResponse(BaseModel):
    # -----------------------------
    # Basic QR Information
    # -----------------------------
    decoded_text: str
    qr_type: str

    # -----------------------------
    # Risk Analysis
    # -----------------------------
    risk_score: int
    status: str

    # -----------------------------
    # UPI Details
    # -----------------------------
    upi_id: Optional[str] = None
    merchant: Optional[str] = None
    amount: Optional[str] = None

    # -----------------------------
    # URL Validation
    # -----------------------------
    validation: Optional[Dict[str, Any]] = None

    # -----------------------------
    # AI Reasons
    # -----------------------------
    reason: List[str]

    # ===================================================
    # NEW AI MODULES
    # ===================================================

    # OCR
    ocr_text: Optional[str] = None

    # Brand Verification
    brand_verification: Optional[Dict[str, Any]] = None

    # Domain Reputation
    domain_reputation: Optional[Dict[str, Any]] = None

    # VirusTotal
    virustotal: Optional[Dict[str, Any]] = None

    # OpenPhish
    openphish: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True