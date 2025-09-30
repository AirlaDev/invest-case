import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = "junior-secret-key"
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    # Converter para bytes e usar bcrypt diretamente
    password_bytes = password.encode('utf-8')
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except:
        return False

def create_token(email: str) -> str:
    data = {"sub": email}
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)