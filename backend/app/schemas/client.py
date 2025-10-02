from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class ClientBase(BaseModel):
    name: str
    email: EmailStr
    is_active: Optional[bool] = True

class ClientCreate(ClientBase):
    pass

class ClientPublic(ClientBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ClientList(BaseModel):
    clients: list[ClientPublic]
    total: int
    page: int
    pages: int