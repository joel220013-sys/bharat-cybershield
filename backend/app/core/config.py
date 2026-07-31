import os
from dotenv import load_dotenv

# --------------------------------------------------
# Load Environment Variables
# --------------------------------------------------

load_dotenv()

# --------------------------------------------------
# Database
# --------------------------------------------------

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:password@localhost:5432/bharat_cybershield"
)

# --------------------------------------------------
# JWT Configuration
# --------------------------------------------------

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "your-secret-key"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)
)

# --------------------------------------------------
# Google Safe Browsing
# --------------------------------------------------

GOOGLE_SAFE_BROWSING_API_KEY = os.getenv(
    "GOOGLE_SAFE_BROWSING_API_KEY",
    ""
)

# --------------------------------------------------
# VirusTotal
# --------------------------------------------------

VIRUSTOTAL_API_KEY = os.getenv(
    "VIRUSTOTAL_API_KEY",
    ""
)

# --------------------------------------------------
# Debug (Optional)
# --------------------------------------------------

print("=" * 60)
print("CONFIG LOADED")
print("DATABASE_URL:", DATABASE_URL)

if GOOGLE_SAFE_BROWSING_API_KEY:
    print(
        "SAFE BROWSING KEY:",
        GOOGLE_SAFE_BROWSING_API_KEY[:10] + "..."
    )
else:
    print("SAFE BROWSING KEY: NOT FOUND")

if VIRUSTOTAL_API_KEY:
    print(
        "VIRUSTOTAL KEY:",
        VIRUSTOTAL_API_KEY[:10] + "..."
    )
else:
    print("VIRUSTOTAL KEY: NOT FOUND")

print("=" * 60)