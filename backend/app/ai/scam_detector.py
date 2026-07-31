import re

# Suspicious keywords and their risk scores
SCAM_KEYWORDS = {
    "win": 20,
    "winner": 20,
    "coupon": 15,
    "reward": 20,
    "free": 15,
    "gift": 20,
    "limited time": 15,
    "offer": 10,
    "claim": 20,
    "prize": 20,
    "scan now": 10,
    "don't miss": 10,
    "urgent": 20,
    "verify": 25,
    "otp": 30,
    "kyc": 30,
    "bank": 10,
}


def analyze_text(text: str):
    text = text.lower()

    score = 0
    reasons = []

    for keyword, value in SCAM_KEYWORDS.items():
        if re.search(r"\b" + re.escape(keyword) + r"\b", text):
            score += value
            reasons.append(f"Detected keyword: '{keyword}'")

    # Cap the score at 100
    score = min(score, 100)

    if score >= 80:
        status = "Danger"
    elif score >= 40:
        status = "Suspicious"
    else:
        status = "Safe"

    return {
        "score": score,
        "status": status,
        "reasons": reasons
    }