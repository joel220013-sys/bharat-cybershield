from app.db.database import Base, engine

# Import all models
from app.models.user import User
from app.models.qr_scan import QRScan

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")