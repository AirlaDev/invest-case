from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.sql import func
import enum
from app.database import Base

class MovementType(enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"

class Movement(Base):
    __tablename__ = "movements"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, nullable=False)
    type = Column(Enum(MovementType), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    note = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())