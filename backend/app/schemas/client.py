from pydantic import BaseModel, EmailStr
from datetime import datetime

class ClientBase(BaseModel):
    name: str
    email: EmailStr
    is_active: bool = True

class ClientCreate(ClientBase):
    pass

class ClientPublic(ClientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True