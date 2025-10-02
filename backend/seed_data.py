import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.asset import Asset

async def seed():
    engine = create_async_engine("postgresql+asyncpg://invest:investpw@db:5432/investdb")
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        assets = [
            Asset(ticker="PETR4.SA", name="Petrobras PN", exchange="SAO", currency="BRL"),
            Asset(ticker="VALE3.SA", name="Vale ON", exchange="SAO", currency="BRL"),
            Asset(ticker="ITUB4.SA", name="Itaú Unibanco PN", exchange="SAO", currency="BRL"),
            Asset(ticker="AAPL", name="Apple Inc.", exchange="NASDAQ", currency="USD"),
            Asset(ticker="MSFT", name="Microsoft", exchange="NASDAQ", currency="USD"),
        ]
        
        for asset in assets:
            session.add(asset)
        
        await session.commit()
        print("✅ Ativos criados com sucesso!")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())