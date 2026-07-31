from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import DATABASE_URL

# ==========================================
# DEBUG - Print Database URL
# ==========================================
print("=" * 60)
print("DATABASE URL:")
print(DATABASE_URL)
print("=" * 60)

# ==========================================
# Create Engine
# ==========================================
engine = create_engine(
    DATABASE_URL,
    echo=True  # Shows SQL queries in terminal
)

# ==========================================
# Session
# ==========================================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ==========================================
# Base Model
# ==========================================
Base = declarative_base()


# ==========================================
# Dependency
# ==========================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()