import os
from dotenv import load_dotenv

# ==================================================
# Load Environment Variables
# ==================================================

load_dotenv()

# ==================================================
# Database Configuration
# ==================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:joel123@localhost:5432/bharat_cybershield"
)

# ==================================================
# JWT Configuration
# ==================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "bharat-cybershield-secret-2025"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        60
    )
)

# ==================================================
# Google Safe Browsing API
# ==================================================

GOOGLE_SAFE_BROWSING_API_KEY = os.getenv(
    "GOOGLE_SAFE_BROWSING_API_KEY",
    ""
)

# ==================================================
# VirusTotal API
# ==================================================

VIRUSTOTAL_API_KEY = os.getenv(
    "VIRUSTOTAL_API_KEY",
    ""
)

# ==================================================
# OpenPhish API (Optional)
# ==================================================

OPENPHISH_API_KEY = os.getenv(
    "OPENPHISH_API_KEY",
    ""
)

# ==================================================
# Debug Configuration
# ==================================================

DEBUG = os.getenv(
    "DEBUG",
    "True"
).lower() == "true"

if DEBUG:
    print("=" * 60)
    print(" Bharat CyberShield Configuration")
    print("=" * 60)
    print(f"DATABASE      : {DATABASE_URL}")

    print(
        "GOOGLE API    :",
        "Loaded" if GOOGLE_SAFE_BROWSING_API_KEY else "Not Found"
    )

    print(
        "VIRUSTOTAL API:",
        "Loaded" if VIRUSTOTAL_API_KEY else "Not Found"
    )

    print(
        "OPENPHISH API :",
        "Loaded" if OPENPHISH_API_KEY else "Not Found"
    )

    print("=" * 60)