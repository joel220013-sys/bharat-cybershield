import requests

OPENPHISH_FEED = "https://openphish.com/feed.txt"


def check_openphish(url: str):
    """
    Check whether a URL exists in the OpenPhish free phishing feed.

    Returns:
    {
        "score": int,
        "status": str,
        "reason": str
    }
    """

    try:
        headers = {
            "User-Agent": "BharatCyberShield/1.0"
        }

        response = requests.get(
            OPENPHISH_FEED,
            headers=headers,
            timeout=20
        )

        response.raise_for_status()

        phishing_urls = {
            line.strip()
            for line in response.text.splitlines()
            if line.strip()
        }

        scanned_url = url.strip()

        if scanned_url in phishing_urls:
            return {
                "score": 40,
                "status": "Phishing",
                "reason": "URL found in OpenPhish phishing feed"
            }

        return {
            "score": 0,
            "status": "Safe",
            "reason": "URL not found in OpenPhish feed"
        }

    except requests.exceptions.Timeout:
        return {
            "score": 0,
            "status": "Error",
            "reason": "Connection to OpenPhish timed out"
        }

    except requests.exceptions.HTTPError as e:
        return {
            "score": 0,
            "status": "Error",
            "reason": f"HTTP Error: {e}"
        }

    except requests.exceptions.RequestException as e:
        return {
            "score": 0,
            "status": "Error",
            "reason": f"Request failed: {e}"
        }

    except Exception as e:
        return {
            "score": 0,
            "status": "Error",
            "reason": str(e)
        }