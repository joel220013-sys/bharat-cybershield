import base64
import requests

from app.core.config import VIRUSTOTAL_API_KEY

VT_URL = "https://www.virustotal.com/api/v3/urls"


def check_url_virustotal(url: str):
    """
    Check a URL using VirusTotal's cached analysis.

    Returns:
    {
        "score": int,
        "status": str,
        "malicious": int,
        "suspicious": int,
        "harmless": int,
        "reason": str
    }
    """

    if not VIRUSTOTAL_API_KEY:
        return {
            "score": 0,
            "status": "Unavailable",
            "malicious": 0,
            "suspicious": 0,
            "harmless": 0,
            "reason": "VirusTotal API key not configured"
        }

    headers = {
        "x-apikey": VIRUSTOTAL_API_KEY
    }

    try:
        # Compute the URL identifier expected by VirusTotal
        url_id = base64.urlsafe_b64encode(
            url.encode("utf-8")
        ).decode("utf-8").rstrip("=")

        response = requests.get(
            f"{VT_URL}/{url_id}",
            headers=headers,
            timeout=20
        )

        if response.status_code == 404:
            return {
                "score": 0,
                "status": "Not Found",
                "malicious": 0,
                "suspicious": 0,
                "harmless": 0,
                "reason": "No cached VirusTotal analysis available for this URL."
            }

        if response.status_code != 200:
            return {
                "score": 0,
                "status": "Error",
                "malicious": 0,
                "suspicious": 0,
                "harmless": 0,
                "reason": f"VirusTotal Error: {response.status_code} - {response.text}"
            }

        stats = response.json()["data"]["attributes"]["last_analysis_stats"]

        malicious = stats.get("malicious", 0)
        suspicious = stats.get("suspicious", 0)
        harmless = stats.get("harmless", 0)

        score = min(malicious * 10 + suspicious * 5, 100)

        if malicious > 0:
            status = "Malicious"
        elif suspicious > 0:
            status = "Suspicious"
        else:
            status = "Safe"

        return {
            "score": score,
            "status": status,
            "malicious": malicious,
            "suspicious": suspicious,
            "harmless": harmless,
            "reason": f"{malicious} malicious, {suspicious} suspicious detections"
        }

    except requests.RequestException as e:
        return {
            "score": 0,
            "status": "Error",
            "malicious": 0,
            "suspicious": 0,
            "harmless": 0,
            "reason": str(e)
        }

    except Exception as e:
        return {
            "score": 0,
            "status": "Error",
            "malicious": 0,
            "suspicious": 0,
            "harmless": 0,
            "reason": str(e)
        }