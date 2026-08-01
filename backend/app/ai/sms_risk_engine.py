from app.ai.url_validator import validate_url
from app.ai.safe_browsing import check_url
from app.ai.virustotal import check_url_virustotal
from app.ai.openphish import check_openphish


def calculate_sms_risk(urls):
    score = 0
    reasons = []

    validation = None
    vt_result = None
    openphish_result = None

    if not urls:
        return {
            "risk_score": 0,
            "status": "Safe",
            "reasons": [],
            "validation": None,
            "virustotal": None,
            "openphish": None,
        }

    # Analyze the first URL found
    url = urls[0]

    score += 20
    reasons.append("Contains URL")

    validation = validate_url(url)

    # HTTPS
    if not validation.get("https", True):
        score += 20
        reasons.append("Website is not using HTTPS")

    # URL Shortener
    if validation.get("shortener", False):
        score += 25
        reasons.append("URL Shortener Detected")

    # IP Address
    if validation.get("ip_address", False):
        score += 30
        reasons.append("Uses IP Address")

    # Too many subdomains
    if validation.get("subdomain_count", 0) > 3:
        score += 10
        reasons.append("Too many subdomains")

    # Suspicious keywords
    keywords = validation.get("suspicious_keywords", [])
    if keywords:
        score += 15
        reasons.append(
            "Suspicious keywords: " + ", ".join(keywords)
        )

    # Google Safe Browsing
    try:
        unsafe, message = check_url(url)

        if unsafe:
            score += 40
            reasons.append("Flagged by Google Safe Browsing")
        elif message:
            reasons.append(message)

    except Exception:
        pass

    # VirusTotal
    try:
        vt_result = check_url_virustotal(url)

        if vt_result["score"] > 0:
            score += vt_result["score"]

        if vt_result["reason"]:
            reasons.append(vt_result["reason"])

    except Exception:
        vt_result = None

    # OpenPhish
    try:
        openphish_result = check_openphish(url)

        if openphish_result["score"] > 0:
            score += openphish_result["score"]

        if openphish_result["reason"]:
            reasons.append(openphish_result["reason"])

    except Exception:
        openphish_result = None

    score = min(score, 100)

    if score >= 80:
        status = "Danger"
    elif score >= 50:
        status = "Suspicious"
    else:
        status = "Safe"

    return {
        "risk_score": score,
        "status": status,
        "reasons": reasons,
        "validation": validation,
        "virustotal": vt_result,
        "openphish": openphish_result,
    }