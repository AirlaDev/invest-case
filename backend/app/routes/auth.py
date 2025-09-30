from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserLogin, Token
from app.auth import verify_password, create_token, hash_password

router = APIRouter()

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    
    token = create_token(user.email)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/setup")
def setup_initial_user(db: Session = Depends(get_db)):
    if db.query(User).first():
        return {"message": "Sistema já configurado"}
    
    user = User(
        email="admin@invest.com",
        password=hash_password("admin123")
    )
    db.add(user)
    db.commit()
    return {"message": "Usuário admin criado: admin@invest.com / admin123"}