from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# -------------------------------------------------
# API Routers
# -------------------------------------------------

from app.api.v1.auth import router as auth_router
from app.api.v1.qr import router as qr_router
from app.api.v1.history import router as history_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.sms import router as sms_router
from app.api.v1.sms_history import router as sms_history_router
from app.api.v1.email import router as email_router
from app.api.v1.email_history import router as email_history_router

from app.db.database import Base, engine

# -------------------------------------------------
# Import ALL models BEFORE create_all()
# -------------------------------------------------

from app.models.user import User
from app.models.qr_scan import QRScan
from app.models.sms_scan import SMSScan
from app.models.email_scan import EmailScan

# -------------------------------------------------
# DEBUG
# -------------------------------------------------

print("=" * 60)
print("REGISTERED TABLES:")
print(Base.metadata.tables.keys())
print("=" * 60)

# -------------------------------------------------
# Create Database Tables
# -------------------------------------------------

Base.metadata.create_all(bind=engine)

print("=" * 60)
print("DATABASE TABLES CREATED")
print("=" * 60)

# -------------------------------------------------
# FastAPI App
# -------------------------------------------------

app = FastAPI(
    title="Bharat CyberShield API",
    version="1.0.0",
    description="AI-Powered Cyber Security Platform"
)

# -------------------------------------------------
# CORS
# -------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Register Routers
# -------------------------------------------------

app.include_router(auth_router)
app.include_router(qr_router)
app.include_router(history_router)
app.include_router(dashboard_router)
app.include_router(sms_router)
app.include_router(sms_history_router)
app.include_router(email_router)
app.include_router(email_history_router)

# -------------------------------------------------
# Root
# -------------------------------------------------

@app.get("/")
def root():
    return {
        "app": "Bharat CyberShield",
        "version": "1.0.0",
        "status": "Running",
        "docs": "/docs",
        "features": [
            "Authentication",
            "QR Scanner",
            "Live Camera Scanner",
            "SMS Scam Detection",
            "Email Phishing Detection",
            "SMS History",
            "Email History",
            "OCR",
            "Brand Verification",
            "URL Analyzer",
            "URL Validator",
            "Domain Reputation",
            "VirusTotal",
            "Google Safe Browsing",
            "OpenPhish",
            "Scan History",
            "Dashboard"
        ]
    }

# -------------------------------------------------
# Health Check
# -------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected"
    }