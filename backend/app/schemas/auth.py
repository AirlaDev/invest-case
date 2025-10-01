from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class UserPublic(BaseModel):
    id: int
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True

# Este é o schema que estava faltando
class UserCreate(BaseModel):
    email: EmailStr
    password: str