from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import clients, assets, movements, auth

app = FastAPI(title="InvestCase API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(auth.router, prefix="/api")
app.include_router(clients.router, prefix="/api")
app.include_router(assets.router, prefix="/api")
app.include_router(movements.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "InvestCase API está rodando!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Rota para listar todas as rotas disponíveis
@app.get("/routes")
async def list_routes():
    routes = []
    for route in app.routes:
        routes.append({
            "path": route.path,
            "methods": list(route.methods) if hasattr(route, 'methods') else []
        })
    return routes