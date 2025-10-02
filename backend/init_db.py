import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.client import Client
from app.models.asset import Asset, Allocation
from app.models.movement import Movement
from app.database import Base

async def init_db():
    """Cria todas as tabelas no banco de dados"""
    
    # URL do PostgreSQL
    DATABASE_URL = "postgresql+asyncpg://invest:investpw@db:5432/investdb"
    
    print("🔄 Conectando ao banco de dados...")
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    print("🗑️  Deletando tabelas existentes...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    print("✨ Criando novas tabelas...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Banco de dados inicializado com sucesso!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db())