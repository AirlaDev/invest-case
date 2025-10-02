from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configurar CORS para aceitar ambas as portas
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Porta padrão do Next.js
        "http://localhost:3001",  # Porta alternativa
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/test")
def test_api():
    return {"message": "API funcionando!"}

@app.get("/api/clients")
def get_clients():
    return [
        {"id": 1, "name": "Cliente 1", "email": "cliente1@email.com", "is_active": True},
        {"id": 2, "name": "Cliente 2", "email": "cliente2@email.com", "is_active": True},
        {"id": 3, "name": "Cliente 3", "email": "cliente3@email.com", "is_active": False}
    ]

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "Backend rodando na porta 8000"}