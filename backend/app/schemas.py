from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Schemas para Client
class ClientBase(BaseModel):
    name: str
    email: str
    is_active: bool = True

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: int
    created_at: str
    
    class Config:
        from_attributes = True