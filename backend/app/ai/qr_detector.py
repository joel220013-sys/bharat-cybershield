from urllib.parse import urlparse, parse_qs

import cv2
import zxingcpp


def read_qr(image_path: str):
    """
    Read QR code using ZXing-C++.
    """

    image = cv2.imread(image_path)

    if image is None:
        return None

    # Convert BGR -> RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    results = zxingcpp.read_barcodes(image)

    if not results:
        return None

    return results[0].text


def analyze_qr(data: str):

    result = {
        "decoded_text": data,
        "qr_type": "TEXT",
        "risk_score": 0,
        "status": "Safe",
        "upi_id": None,
        "merchant": None,
        "amount": None,
        "reason": []
    }

    if data.startswith("upi://"):

        result["qr_type"] = "UPI"

        parsed = urlparse(data)

        params = parse_qs(parsed.query)

        result["upi_id"] = params.get("pa", [None])[0]
        result["merchant"] = params.get("pn", [None])[0]
        result["amount"] = params.get("am", [None])[0]

        score = 10

        if result["amount"]:
            score += 10

        if not result["merchant"]:
            score += 20
            result["reason"].append("Merchant name missing")

        if not result["upi_id"]:
            score += 50
            result["reason"].append("UPI ID missing")

        result["risk_score"] = score

        if score >= 60:
            result["status"] = "Danger"

        elif score >= 30:
            result["status"] = "Suspicious"

        else:
            result["status"] = "Safe"

    elif data.startswith("http"):

        result["qr_type"] = "URL"

        score = 40

        if "bit.ly" in data:
            score += 30
            result["reason"].append("Shortened URL")

        if "@" in data:
            score += 20
            result["reason"].append("Suspicious URL")

        result["risk_score"] = score

        if score >= 60:
            result["status"] = "Danger"
        else:
            result["status"] = "Check Carefully"

    return result