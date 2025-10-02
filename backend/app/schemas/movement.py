from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class MovementType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"

class MovementBase(BaseModel):
    client_id: int
    type: MovementType
    amount: float
    date: datetime
    note: Optional[str] = None

class MovementCreate(MovementBase):
    pass

class MovementPublic(MovementBase):
    id: int
    created_at: datetime
    client_name: str
    
    class Config:
        from_attributes = True

class MovementSummary(BaseModel):
    total_deposits: float
    total_withdrawals: float
    net_flow: float
    client_summary: List[dict]