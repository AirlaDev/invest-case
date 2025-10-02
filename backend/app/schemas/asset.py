from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class AssetBase(BaseModel):
    ticker: str
    name: str
    exchange: Optional[str] = None
    currency: str = "BRL"

class AssetCreate(AssetBase):
    pass

class AssetPublic(AssetBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AllocationBase(BaseModel):
    client_id: int
    asset_id: int
    quantity: float
    buy_price: float
    buy_date: datetime

class AllocationCreate(AllocationBase):
    pass

class AllocationPublic(AllocationBase):
    id: int
    created_at: datetime
    asset_ticker: str
    asset_name: str
    client_name: str
    total_invested: float
    
    class Config:
        from_attributes = True