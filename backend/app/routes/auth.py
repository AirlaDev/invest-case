from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserLogin, Token
from app.auth import verify_password, create_access_token, get_password_hash

router = APIRouter()

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuário inativo")
    
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/create-initial-user")
def create_initial_user(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == "admin@investflow.com").first()
    if not user:
        hashed_password = get_password_hash("admin123")
        new_user = User(email="admin@investflow.com", password=hashed_password)
        db.add(new_user)
        db.commit()
        return {"message": "Usuário inicial criado"}
    return {"message": "Usuário já existe"}