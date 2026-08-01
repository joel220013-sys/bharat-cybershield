import re

from app.ai.sms_risk_engine import calculate_sms_risk


SCAM_KEYWORDS = {
    "urgent": 15,
    "immediately": 15,
    "verify": 15,
    "update": 10,
    "blocked": 20,
    "suspended": 20,
    "kyc": 20,
    "otp": 25,
    "reward": 20,
    "winner": 25,
    "lottery": 30,
    "prize": 20,
    "claim": 15,
    "click": 10,
    "bank": 10,
    "account": 10,
    "upi": 10,
    "payment": 10,
    "refund": 15,
    "limited": 10,
    "offer": 10,
    "free": 10,
}


def analyze_sms(message: str):

    text = message.lower()

    keyword_score = 0
    reasons = []

    # ----------------------------------------
    # Keyword Detection
    # ----------------------------------------

    for keyword, risk in SCAM_KEYWORDS.items():

        if keyword in text:
            keyword_score += risk
            reasons.append(f"Detected keyword: '{keyword}'")

    # ----------------------------------------
    # URL Detection
    # ----------------------------------------

    urls = re.findall(r"https?://\S+", message)

    # ----------------------------------------
    # Phone Number Detection
    # ----------------------------------------

    phones = re.findall(r"\b\d{10}\b", message)

    if phones:
        keyword_score += 10
        reasons.append("Contains phone number")

    # ----------------------------------------
    # Advanced URL Risk Analysis
    # ----------------------------------------

    risk_result = calculate_sms_risk(urls)

    total_score = min(
        keyword_score + risk_result["risk_score"],
        100
    )

    # Merge reasons

    for reason in risk_result["reasons"]:
        if reason not in reasons:
            reasons.append(reason)

    # Final Status

    if total_score >= 80:
        status = "Danger"

    elif total_score >= 50:
        status = "Suspicious"

    else:
        status = "Safe"

    return {
        "risk_score": total_score,
        "status": status,
        "reasons": reasons,
        "urls": urls,
        "validation": risk_result["validation"],
        "virustotal": risk_result["virustotal"],
        "openphish": risk_result["openphish"],
    }