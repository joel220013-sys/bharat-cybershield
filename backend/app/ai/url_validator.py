from urllib.parse import urlparse
import ipaddress
import re

SHORTENERS = [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "is.gd",
    "ow.ly",
    "buff.ly",
    "rb.gy"
]

SUSPICIOUS_KEYWORDS = [
    "login",
    "signin",
    "verify",
    "bank",
    "wallet",
    "secure",
    "account",
    "update",
    "password"
]


def validate_url(url: str):

    result = {
        "valid": False,
        "https": False,
        "shortener": False,
        "ip_address": False,
        "suspicious_keywords": [],
        "subdomain_count": 0,
        "reasons": []
    }

    try:
        parsed = urlparse(url)

        if parsed.scheme not in ["http", "https"]:
            result["reasons"].append("Invalid URL scheme")
            return result

        result["valid"] = True

        if parsed.scheme == "https":
            result["https"] = True

        domain = parsed.netloc.lower()

        # URL shortener
        for short in SHORTENERS:
            if short in domain:
                result["shortener"] = True
                result["reasons"].append("URL Shortener Detected")
                break

        # IP Address
        try:
            ipaddress.ip_address(domain.split(":")[0])
            result["ip_address"] = True
            result["reasons"].append("Uses IP Address")
        except:
            pass

        # Keywords
        for word in SUSPICIOUS_KEYWORDS:
            if word in url.lower():
                result["suspicious_keywords"].append(word)

        if result["suspicious_keywords"]:
            result["reasons"].append("Sensitive keywords detected")

        # Subdomains
        parts = domain.split(".")
        result["subdomain_count"] = max(len(parts)-2,0)

        if result["subdomain_count"] > 3:
            result["reasons"].append("Too many subdomains")

        return result

    except Exception:
        result["reasons"].append("Invalid URL")
        return result
    