import requests

OPENPHISH_FEED = "https://openphish.com/feed.txt"


def check_openphish(url: str):
    """
    Check whether a URL appears in the OpenPhish feed.

    Returns:
    {
        "score": int,
        "status": str,
        "reason": str
    }
    """

    try:
        response = requests.get(
            OPENPHISH_FEED,
            timeout=20
        )

        if response.status_code != 200:
            return {
                "score": 0,
                "status": "Unavailable",
                "reason": "Unable to access OpenPhish feed"
            }

        phishing_urls = response.text.splitlines()

        if url.strip() in phishing_urls:
            return {
                "score": 40,
                "status": "Phishing",
                "reason": "URL found in OpenPhish phishing database"
            }

        return {
            "score": 0,
            "status": "Safe",
            "reason": "URL not found in OpenPhish database"
        }

    except requests.exceptions.Timeout:
        return {
            "score": 0,
            "status": "Error",
            "reason": "OpenPhish request timed out"
        }

    except requests.exceptions.RequestException as e:
        return {
            "score": 0,
            "status": "Error",
            "reason": str(e)
        }

    except Exception as e:
        return {
            "score": 0,
            "status": "Error",
            "reason": str(e)
        }