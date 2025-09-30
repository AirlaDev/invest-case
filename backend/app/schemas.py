from pydantic import BaseModel
from datetime import datetime

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ClientBase(BaseModel):
    name: str
    email: str

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: int
    is_active: bool = True

class Asset(BaseModel):
    id: int
    ticker: str
    name: str
    exchange: str
    currency: str

class AllocationBase(BaseModel):
    asset_id: int
    quantity: float
    buy_price: float
    buy_date: datetime

class AllocationCreate(AllocationBase):
    pass

class AllocationSchema(AllocationBase):
    id: int
    client_id: int

class MovementBase(BaseModel):
    type: str
    amount: float
    note: str | None = None

class MovementCreate(MovementBase):
    pass

class MovementSchema(MovementBase):
    id: int
    client_id: int
    date: datetime