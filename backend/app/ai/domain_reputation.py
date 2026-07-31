import whois
from urllib.parse import urlparse
from datetime import datetime, timezone


def check_domain_reputation(url: str):
    """
    Analyze a domain using WHOIS information.

    Returns:
    {
        "score": int,
        "creation_date": str,
        "expiration_date": str,
        "reasons": list
    }
    """

    try:
        domain = urlparse(url).netloc

        # Remove port if present
        if ":" in domain:
            domain = domain.split(":")[0]

        # Remove www.
        if domain.startswith("www."):
            domain = domain[4:]

        w = whois.whois(domain)

        creation_date = w.creation_date
        expiration_date = w.expiration_date

        # Some WHOIS servers return lists
        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if isinstance(expiration_date, list):
            expiration_date = expiration_date[0]

        score = 0
        reasons = []

        if creation_date:

            # Convert timezone-aware datetime to naive UTC
            if creation_date.tzinfo is not None:
                creation_date = creation_date.astimezone(
                    timezone.utc
                ).replace(tzinfo=None)

            today = datetime.utcnow()

            age = (today - creation_date).days

            if age < 30:
                score += 40
                reasons.append(
                    f"Domain registered only {age} days ago"
                )

            elif age < 180:
                score += 20
                reasons.append(
                    f"New domain ({age} days old)"
                )

            else:
                reasons.append(
                    f"Domain age: {age} days"
                )

        else:
            score += 20
            reasons.append(
                "Unable to determine domain age"
            )

        return {
            "score": score,
            "creation_date": str(creation_date),
            "expiration_date": str(expiration_date),
            "reasons": reasons
        }

    except Exception as e:

        return {
            "score": 10,
            "creation_date": None,
            "expiration_date": None,
            "reasons": [
                f"WHOIS lookup failed: {str(e)}"
            ]
        }