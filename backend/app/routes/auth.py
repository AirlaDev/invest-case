from fastapi import APIRouter, HTTPException, Depends
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
    try:
        print("✅ Rota /setup foi chamada!")
        
        # Verificar se já existe usuário
        existing_user = db.query(User).first()
        if existing_user:
            print("⚠️  Usuário já existe")
            return {"message": "Sistema já configurado"}
        
        # SENHA MAIS CURTA para evitar erro do bcrypt
        senha_simples = "admin123"
        
        # Criar usuário
        user = User(
            email="admin@invest.com",
            password=hash_password(senha_simples)  # Senha curta
        )
        db.add(user)
        db.commit()
        
        print("✅ Usuário criado com sucesso!")
        return {"message": f"Usuário admin criado: admin@invest.com / {senha_simples}"}
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {e}")
        # Mensagem de erro mais amigável
        return {"error": f"Não foi possível criar usuário: {str(e)}"}