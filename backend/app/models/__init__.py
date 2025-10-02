from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class MovementType(enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    allocations = relationship("Allocation", back_populates="client")
    movements = relationship("Movement", back_populates="client")

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    exchange = Column(String(100))
    currency = Column(String(10), default="BRL")
    
    # Relationships
    allocations = relationship("Allocation", back_populates="asset")

class Allocation(Base):
    __tablename__ = "allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    buy_price = Column(Float, nullable=False)
    buy_date = Column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    client = relationship("Client", back_populates="allocations")
    asset = relationship("Asset", back_populates="allocations")

class Movement(Base):
    __tablename__ = "movements"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    type = Column(SQLEnum(MovementType), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    note = Column(Text)
    
    # Relationships
    client = relationship("Client", back_populates="movements")