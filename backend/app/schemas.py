from pydantic import BaseModel

# Apenas o essencial
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