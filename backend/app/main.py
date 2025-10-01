from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Invest Case API", version="1.0.0")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Invest Case API está funcionando!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/test")
async def test_endpoint():
    return {"test": "success", "message": "Backend está funcionando!"}

# Comente as importações problemáticas por enquanto
# from app.routes import auth, clients, assets, movements
# app.include_router(auth.router, prefix="/auth", tags=["auth"])
# app.include_router(clients.router, prefix="/clients", tags=["clients"])
# app.include_router(assets.router, prefix="/assets", tags=["assets"])
# app.include_router(movements.router, prefix="/movements", tags=["movements"])