from urllib.parse import urlparse

from app.ai.url_analyzer import analyze_url
from app.ai.url_validator import validate_url


def calculate_risk(result):
    score = 0
    reasons = []

    qr_type = result.get("qr_type", "Unknown")

    # ==========================
    # UPI QR Analysis
    # ==========================
    if qr_type == "UPI":

        upi_id = result.get("upi_id")
        merchant = result.get("merchant")
        amount = result.get("amount")

        if upi_id:
            reasons.append("Valid UPI ID detected")
        else:
            score += 60
            reasons.append("Missing UPI ID")

        if merchant:
            reasons.append("Merchant name available")
        else:
            score += 10
            reasons.append("Merchant name not provided")

        if amount:
            reasons.append("Pre-filled payment amount detected")

    # ==========================
    # URL QR Analysis
    # ==========================
    elif qr_type == "URL":

        url = result.get("decoded_text", "")

        # Local AI URL Analysis
        local_score, local_reasons = analyze_url(url)

        score += local_score
        reasons.extend(local_reasons)

        # URL Validation
        validation = validate_url(url)

        if validation["https"]:
            reasons.append("Uses HTTPS")
        else:
            score += 10
            reasons.append("Uses HTTP instead of HTTPS")

        if validation["shortener"]:
            score += 20
            reasons.append("URL Shortener Detected")

        if validation["ip_address"]:
            score += 30
            reasons.append("Uses IP Address")

        if validation["subdomain_count"] > 3:
            score += 10
            reasons.append("Too many subdomains")

        if validation["suspicious_keywords"]:
            score += 10
            reasons.append(
                "Suspicious keywords: "
                + ", ".join(validation["suspicious_keywords"])
            )

        parsed = urlparse(url)

        if not parsed.netloc:
            score += 40
            reasons.append("Invalid URL")

        if len(url) > 150:
            score += 10
            reasons.append("Very long URL")

        if "@" in url:
            score += 20
            reasons.append("Contains @ symbol")

        if score == 0:
            reasons.append("No suspicious URL characteristics detected")

    # ==========================
    # WiFi QR
    # ==========================
    elif qr_type == "WiFi":

        score += 5
        reasons.append("Contains WiFi credentials")

    # ==========================
    # Contact QR
    # ==========================
    elif qr_type == "Contact":

        score += 2
        reasons.append("Contains contact information")

    # ==========================
    # SMS QR
    # ==========================
    elif qr_type == "SMS":

        score += 25
        reasons.append("Can automatically compose SMS")

    # ==========================
    # Email QR
    # ==========================
    elif qr_type == "Email":

        score += 15
        reasons.append("Contains email information")

    # ==========================
    # Unknown QR
    # ==========================
    else:

        score += 50
        reasons.append("Unknown QR Type")

    # Limit Score
    score = min(score, 100)

    # Final Status
    if score >= 80:
        status = "Danger"

    elif score >= 40:
        status = "Suspicious"

    else:
        status = "Safe"

    return score, status, reasons