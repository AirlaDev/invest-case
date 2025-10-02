from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from datetime import timedelta, datetime
import bcrypt

router = APIRouter(tags=["auth"])

SECRET_KEY = "junior-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Usuários do sistema - SIMPLES E DIRETO
fake_users_db = {
    "admin": {
        "username": "admin",
        "full_name": "Administrator",
        "email": "admin@invest.com",
        "password": "admin123",  # ✅ Senha em texto plano para desenvolvimento
        "disabled": False,
    }
}

def verify_password(plain_password: str, stored_password: str) -> bool:
    """Verifica se a senha está correta"""
    return plain_password == stored_password

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(username: str, password: str):
    print(f"🔐 Tentando autenticar usuário: {username}")
    user = fake_users_db.get(username)
    if not user:
        print(f"❌ Usuário {username} não encontrado")
        return False
    
    print(f"✅ Usuário encontrado: {user['username']}")
    print(f"🔑 Verificando senha...")
    print(f"Senha fornecida: '{password}'")
    print(f"Senha esperada: '{user['password']}'")
    
    # Verificar senha
    password_ok = verify_password(password, user["password"])
    print(f"Senha correta: {password_ok}")
    
    if not password_ok:
        print(f"❌ Senha incorreta para {username}")
        return False
    
    print(f"✅ Login bem-sucedido para {username}")
    return user

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    print(f"\n🚀 Recebendo requisição de login")
    print(f"Username: {form_data.username}")
    print(f"Password length: {len(form_data.password)}")
    
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        print("❌ Autenticação falhou")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    print(f"✅ Token gerado com sucesso para {user['username']}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user["username"],
        "full_name": user["full_name"]
    }