from urllib.parse import urlparse
import ipaddress
import re

# ===========================
# URL Shorteners
# ===========================
SHORTENERS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "is.gd",
    "ow.ly",
    "buff.ly",
    "cutt.ly",
    "rebrand.ly",
    "shorturl.at",
    "rb.gy",
    "tiny.cc",
}

# ===========================
# Suspicious Keywords
# ===========================
SUSPICIOUS_WORDS = {
    "login",
    "signin",
    "verify",
    "secure",
    "update",
    "bank",
    "wallet",
    "pay",
    "payment",
    "upi",
    "gift",
    "otp",
    "reward",
    "bonus",
    "kyc",
    "account",
    "password",
    "confirm",
    "refund",
    "support",
}

# ===========================
# Suspicious TLDs
# ===========================
SUSPICIOUS_TLDS = {
    ".zip",
    ".click",
    ".top",
    ".xyz",
    ".gq",
    ".tk",
    ".ml",
    ".cf",
    ".work",
    ".live",
}


def analyze_url(url: str):
    score = 0
    reasons = []

    try:
        parsed = urlparse(url)

        domain = parsed.netloc.lower()
        scheme = parsed.scheme.lower()
        path = parsed.path.lower()

        # -------------------------
        # HTTPS Check
        # -------------------------
        if scheme != "https":
            score += 20
            reasons.append("URL does not use HTTPS")

        # -------------------------
        # IP Address
        # -------------------------
        try:
            ipaddress.ip_address(domain.split(":")[0])
            score += 30
            reasons.append("Uses an IP address instead of a domain")
        except ValueError:
            pass

        # -------------------------
        # URL Shortener
        # -------------------------
        if domain in SHORTENERS:
            score += 20
            reasons.append("Uses a URL shortening service")

        # -------------------------
        # Too Many Subdomains
        # -------------------------
        if domain.count(".") >= 3:
            score += 15
            reasons.append("Contains many subdomains")

        # -------------------------
        # Punycode
        # -------------------------
        if "xn--" in domain:
            score += 40
            reasons.append("Contains Punycode domain")

        # -------------------------
        # Hyphens
        # -------------------------
        if domain.count("-") >= 2:
            score += 10
            reasons.append("Too many hyphens in domain")

        # -------------------------
        # Digits
        # -------------------------
        digits = len(re.findall(r"\d", domain))
        if digits >= 5:
            score += 10
            reasons.append("Domain contains many numbers")

        # -------------------------
        # @ Symbol
        # -------------------------
        if "@" in url:
            score += 20
            reasons.append("Contains @ symbol")

        # -------------------------
        # Encoded Characters
        # -------------------------
        if "%" in url:
            score += 10
            reasons.append("Contains encoded characters")

        # -------------------------
        # Long URL
        # -------------------------
        if len(url) > 120:
            score += 10
            reasons.append("Very long URL")

        # -------------------------
        # Suspicious Keywords
        # -------------------------
        text = f"{domain}{path}"

        found = []

        for word in SUSPICIOUS_WORDS:
            if re.search(rf"\b{re.escape(word)}\b", text):
                found.append(word)

        if found:
            score += min(len(found) * 5, 20)
            reasons.append(
                "Suspicious keywords: " + ", ".join(found)
            )

        # -------------------------
        # Suspicious TLD
        # -------------------------
        for tld in SUSPICIOUS_TLDS:
            if domain.endswith(tld):
                score += 15
                reasons.append(f"Suspicious TLD: {tld}")
                break

        # -------------------------
        # Random-looking Domain
        # -------------------------
        if re.search(r"[a-z]{10,}[0-9]{3,}", domain):
            score += 15
            reasons.append("Random-looking domain")

        # -------------------------
        # Multiple Redirect Symbols
        # -------------------------
        if "//" in url[8:]:
            score += 10
            reasons.append("Contains multiple // characters")

        # -------------------------
        # Normalize Score
        # -------------------------
        score = min(score, 100)

        if score == 0:
            reasons.append("No suspicious URL characteristics detected")

        return score, reasons

    except Exception:
        return 100, ["Invalid URL"]