from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum

class MovementType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# Client Schemas
class ClientBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    is_active: bool = True

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Asset Schemas
class AssetBase(BaseModel):
    ticker: str
    name: str
    exchange: Optional[str] = None
    currency: str = "BRL"

class AssetCreate(AssetBase):
    pass

class Asset(AssetBase):
    id: int
    
    class Config:
        from_attributes = True

# Allocation Schemas
class AllocationBase(BaseModel):
    client_id: int
    asset_id: int
    quantity: float
    buy_price: float
    buy_date: datetime

class AllocationCreate(AllocationBase):
    pass

class Allocation(AllocationBase):
    id: int
    client: Optional[Client] = None
    asset: Optional[Asset] = None
    
    class Config:
        from_attributes = True

# Movement Schemas
class MovementBase(BaseModel):
    client_id: int
    type: MovementType
    amount: float
    date: datetime
    note: Optional[str] = None

class MovementCreate(MovementBase):
    pass

class Movement(MovementBase):
    id: int
    client: Optional[Client] = None
    
    class Config:
        from_attributes = True

# Response schemas with relationships
class ClientWithRelations(Client):
    allocations: List[Allocation] = []
    movements: List[Movement] = []

class AssetWithRelations(Asset):
    allocations: List[Allocation] = []