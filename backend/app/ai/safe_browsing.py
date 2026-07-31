import requests

from app.core.config import GOOGLE_SAFE_BROWSING_API_KEY


def check_url(url: str):
    """
    Check a URL using Google Safe Browsing API.

    Returns:
        (True, "Unsafe URL detected")  -> URL is malicious
        (False, "Safe URL")            -> URL is safe
        (False, "Google Safe Browsing unavailable") -> API error
    """

    if not GOOGLE_SAFE_BROWSING_API_KEY:
        print("=" * 60)
        print("Google Safe Browsing API key not configured.")
        print("=" * 60)
        return False, "Google Safe Browsing API key not configured"

    endpoint = (
        f"https://safebrowsing.googleapis.com/v4/"
        f"threatMatches:find?key={GOOGLE_SAFE_BROWSING_API_KEY}"
    )

    payload = {
        "client": {
            "clientId": "bharat-cybershield",
            "clientVersion": "1.0"
        },
        "threatInfo": {
            "threatTypes": [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            "platformTypes": [
                "ANY_PLATFORM"
            ],
            "threatEntryTypes": [
                "URL"
            ],
            "threatEntries": [
                {
                    "url": url
                }
            ]
        }
    }

    try:
        response = requests.post(
            endpoint,
            json=payload,
            timeout=10
        )

        print("=" * 60)
        print("GOOGLE SAFE BROWSING RESPONSE")
        print("Status Code:", response.status_code)
        print("Response Body:")
        print(response.text)
        print("=" * 60)

        if response.status_code != 200:
            return False, "Google Safe Browsing unavailable"

        data = response.json()

        if data.get("matches"):
            return True, "Unsafe URL detected"

        return False, "Safe URL"

    except requests.RequestException as e:
        print("=" * 60)
        print("GOOGLE SAFE BROWSING EXCEPTION")
        print(str(e))
        print("=" * 60)

        return False, "Google Safe Browsing unavailable"