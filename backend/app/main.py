from fastapi import FastAPI
from app.api.v1.auth import router as auth_router

app = FastAPI(
    title="Bharat CyberShield API",
    version="1.0.0",
    description="AI-powered scam detection platform"
)

app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to Bharat CyberShield 🚀",
        "status": "Backend is running"
    }