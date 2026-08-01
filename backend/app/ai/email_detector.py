import re

# -------------------------------------------------
# Scam Keywords (Positive Risk)
# -------------------------------------------------

EMAIL_SCAM_KEYWORDS = {
    "verify": 20,
    "verification": 20,
    "urgent": 20,
    "immediately": 20,
    "blocked": 25,
    "suspended": 25,
    "password": 15,
    "reset": 15,
    "click": 15,
    "login": 15,
    "kyc": 20,
    "otp": 20,
    "refund": 20,
    "gift": 20,
    "reward": 20,
    "winner": 30,
    "lottery": 35,
    "claim": 20,
    "limited": 15,
    "free": 10,
}

# -------------------------------------------------
# Trusted Domains
# -------------------------------------------------

TRUSTED_DOMAINS = [

    "google.com",
    "gmail.com",

    "microsoft.com",
    "outlook.com",

    "apple.com",

    "amazon.com",
    "amazon.in",

    "famapp.in",
    "trio.so",

    "phonepe.com",
    "paytm.com",

    "gpay.com",

    "hdfcbank.com",
    "icicibank.com",
    "axisbank.com",
    "kotak.com",

    "onlinesbi.sbi",

    "gov.in",
    "nic.in"

]

# -------------------------------------------------
# Suspicious TLD
# -------------------------------------------------

SUSPICIOUS_TLDS = [

    ".xyz",
    ".top",
    ".click",
    ".live",
    ".site",
    ".online",
    ".info",
    ".ru"

]

# -------------------------------------------------
# Analyzer
# -------------------------------------------------

def analyze_email(subject: str, sender: str, body: str):

    text = f"{subject}\n{body}".lower()

    score = 0

    reasons = []

    # ---------------------------------------------
    # Sender Domain
    # ---------------------------------------------

    sender_domain = ""

    if "@" in sender:

        sender_domain = sender.split("@")[-1].lower()

    # ---------------------------------------------
    # Trusted Sender
    # ---------------------------------------------

    trusted = False

    for domain in TRUSTED_DOMAINS:

        if sender_domain.endswith(domain):

            trusted = True

            score -= 30

            reasons.append(
                "Trusted sender domain"
            )

            break

    # ---------------------------------------------
    # Scam Keywords
    # ---------------------------------------------

    for keyword, risk in EMAIL_SCAM_KEYWORDS.items():

        if keyword in text:

            score += risk

            reasons.append(
                f"Keyword detected: {keyword}"
            )

    # ---------------------------------------------
    # Payment Receipt Detection
    # ---------------------------------------------

    payment_words = [

        "transaction id",
        "utr",
        "updated balance",
        "payment successful",
        "you have successfully",
        "paid",
        "debited",
        "credited"

    ]

    if sum(word in text for word in payment_words) >= 3:

        score -= 20

        reasons.append(
            "Legitimate payment receipt pattern"
        )

    # ---------------------------------------------
    # URLs
    # ---------------------------------------------

    urls = re.findall(
        r"https?://[^\s]+",
        body
    )

    external_urls = []

    for url in urls:

        if "mail.google.com" in url:

            continue

        if "outlook.office.com" in url:

            continue

        external_urls.append(url)

    if external_urls:

        score += 20

        reasons.append(
            "Contains external URL"
        )

    if len(external_urls) > 2:

        score += 10

        reasons.append(
            "Multiple external URLs"
        )

    for url in external_urls:

        if url.startswith("http://"):

            score += 15

            reasons.append(
                "Non-HTTPS website"
            )

    # ---------------------------------------------
    # Phone Numbers
    # ---------------------------------------------

    phones = re.findall(
        r"\b[6-9]\d{9}\b",
        body
    )

    if phones:

        score += 5

        reasons.append(
            "Contains phone number"
        )

    # ---------------------------------------------
    # UPI IDs
    # ---------------------------------------------

    upi_ids = re.findall(
        r"[A-Za-z0-9._-]+@[A-Za-z]+",
        body
    )

    if upi_ids:

        score += 5

        reasons.append(
            "Contains UPI ID"
        )

    # ---------------------------------------------
    # Suspicious Domain
    # ---------------------------------------------

    for tld in SUSPICIOUS_TLDS:

        if sender_domain.endswith(tld):

            score += 35

            reasons.append(
                f"Suspicious domain {tld}"
            )

    # ---------------------------------------------
    # Fake Login Pages
    # ---------------------------------------------

    phishing_words = [

        "login immediately",
        "verify account",
        "verify your account",
        "click here",
        "confirm password",
        "update account",
        "security alert"

    ]

    for word in phishing_words:

        if word in text:

            score += 25

            reasons.append(
                f"Phishing phrase: {word}"
            )

    # ---------------------------------------------
    # Score Limits
    # ---------------------------------------------

    score = max(0, min(score, 100))

    # ---------------------------------------------
    # Status
    # ---------------------------------------------

    if score >= 80:

        status = "Danger"

    elif score >= 45:

        status = "Suspicious"

    else:

        status = "Safe"

    return {

        "risk_score": score,

        "status": status,

        "reasons": reasons,

        "urls": external_urls,

        "phones": phones,

        "upi_ids": upi_ids,

        "banks": [],

        "sender_domain": sender_domain

    }