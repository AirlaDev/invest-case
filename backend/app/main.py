from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, clients, assets, movements

Base.metadata.create_all(bind=engine)

app = FastAPI(title="InvestFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(assets.router, prefix="/api/assets", tags=["assets"])
app.include_router(movements.router, prefix="/api/movements", tags=["movements"])

@app.get("/")
def read_root():
    return {"message": "InvestFlow API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}