from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.qr import router as qr_router
from app.api.v1.history import router as history_router
from app.api.v1.dashboard import router as dashboard_router

from app.db.database import Base, engine

# Import all models BEFORE create_all()
from app.models.user import User
from app.models.qr_scan import QRScan

# -------------------------------
# DEBUG
# -------------------------------
print("=" * 50)
print("REGISTERED TABLES:")
print(Base.metadata.tables.keys())
print("=" * 50)

# Create all tables
Base.metadata.create_all(bind=engine)

print("=" * 50)
print("DATABASE TABLES CREATED")
print("=" * 50)

app = FastAPI(
    title="Bharat CyberShield API",
    version="1.0.0",
    description="AI-powered QR Scam Detection Platform"
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
# Routers
# -------------------------------------------------
app.include_router(auth_router)
app.include_router(qr_router)
app.include_router(history_router)
app.include_router(dashboard_router)


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
            "URL Analyzer",
            "URL Validator",
            "Risk Engine",
            "Google Safe Browsing",
            "Scan History",
            "Dashboard"
        ]
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected"
    }