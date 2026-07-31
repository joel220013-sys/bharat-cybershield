from urllib.parse import urlparse

KNOWN_BRANDS = {
    "amazon": ["amazon.in", "amazon.com"],
    "flipkart": ["flipkart.com"],
    "paytm": ["paytm.com"],
    "google": ["google.com"],
    "phonepe": ["phonepe.com"],
    "bhim": ["upi.gov.in"],
    "sbi": ["sbi.co.in"],
    "hdfc": ["hdfcbank.com"],
    "icici": ["icicibank.com"],
    "axis": ["axisbank.com"],
}


def verify_brand(text: str, url: str):
    """
    Verify whether the QR belongs to a known brand.

    Uses BOTH:
    - OCR text
    - URL domain

    Returns:
    {
        "score": int,
        "matched_brand": str | None,
        "reason": str
    }
    """

    text = (text or "").lower()

    domain = urlparse(url).netloc.lower()

    # Remove www.
    if domain.startswith("www."):
        domain = domain[4:]

    for brand, domains in KNOWN_BRANDS.items():

        # -----------------------------
        # Official domain match
        # -----------------------------
        for official in domains:

            if domain == official or domain.endswith("." + official):
                return {
                    "score": 0,
                    "matched_brand": brand.title(),
                    "reason": "Official domain verified"
                }

        # -----------------------------
        # Brand mentioned in OCR but wrong domain
        # -----------------------------
        if brand in text:

            return {
                "score": 40,
                "matched_brand": brand.title(),
                "reason": (
                    f"{brand.title()} is mentioned in the image "
                    "but the QR points to another domain."
                )
            }

        # -----------------------------
        # Brand name appears inside domain
        # Example:
        # google-login.xyz
        # paytm-secure.site
        # amazon-offer.ru
        # -----------------------------
        if brand in domain:

            return {
                "score": 60,
                "matched_brand": brand.title(),
                "reason": (
                    f"Domain contains '{brand}' "
                    "but is not an official domain."
                )
            }

    return {
        "score": 0,
        "matched_brand": None,
        "reason": "No known brand detected"
    }