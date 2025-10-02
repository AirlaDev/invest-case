import yfinance as yf
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.asset import Asset
from app.schemas.asset import AssetCreate

async def search_asset(ticker: str, db: AsyncSession):
    try:
        print(f"🔍 Buscando ativo: {ticker}")
        
        # Buscar no Yahoo Finance
        stock = yf.Ticker(ticker)
        info = stock.info
        
        print(f"📊 Informações recebidas: {list(info.keys())}")
        
        # Extrair dados importantes
        asset_data = AssetCreate(
            ticker=ticker.upper(),
            name=info.get('longName', info.get('shortName', ticker.upper())),
            exchange=info.get('exchange', ''),
            currency=info.get('currency', 'BRL')
        )
        
        print(f"✅ Dados do ativo: {asset_data}")
        
        # Verificar se já existe
        stmt = select(Asset).where(Asset.ticker == ticker.upper())
        result = await db.execute(stmt)
        existing_asset = result.scalars().first()
        
        if existing_asset:
            print(f"📦 Ativo já existe: {existing_asset.ticker}")
            return existing_asset
        
        # Criar novo asset
        new_asset = Asset(**asset_data.dict())
        db.add(new_asset)
        await db.commit()
        await db.refresh(new_asset)
        
        print(f"🎉 Novo ativo criado: {new_asset.ticker} - {new_asset.name}")
        return new_asset
        
    except Exception as e:
        print(f"❌ Erro ao buscar ativo {ticker}: {str(e)}")
        raise Exception(f"Erro ao buscar ativo {ticker}: {str(e)}")