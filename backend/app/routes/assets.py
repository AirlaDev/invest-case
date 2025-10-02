from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime

from app.database import get_session 
from app.models.asset import Asset, Allocation
from app.models.client import Client
from app.schemas.asset import AssetPublic, AllocationCreate, AllocationPublic
from app.services.yahoo_finance import search_asset
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.post("/search/{ticker}", response_model=AssetPublic)
async def search_asset_route(
    ticker: str,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    try:
        asset = await search_asset(ticker, session)
        return asset
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[AssetPublic])
async def list_assets(
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    stmt = select(Asset).order_by(Asset.ticker)
    result = await session.execute(stmt)
    return result.scalars().all()

@router.post("/allocations", response_model=AllocationPublic)
async def create_allocation(
    allocation_data: AllocationCreate,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    # Verificar se cliente existe
    client_stmt = select(Client).where(Client.id == allocation_data.client_id)
    client_result = await session.execute(client_stmt)
    client = client_result.scalars().first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Verificar se asset existe
    asset_stmt = select(Asset).where(Asset.id == allocation_data.asset_id)
    asset_result = await session.execute(asset_stmt)
    asset = asset_result.scalars().first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Ativo não encontrado")
    
    # Criar alocação
    new_allocation = Allocation(**allocation_data.dict())
    session.add(new_allocation)
    await session.commit()
    await session.refresh(new_allocation)
    
    # Retornar com dados relacionados
    return AllocationPublic(
        **new_allocation.__dict__,
        asset_ticker=asset.ticker,
        asset_name=asset.name,
        client_name=client.name,
        total_invested=new_allocation.quantity * new_allocation.buy_price
    )

@router.get("/clients/{client_id}/allocations", response_model=List[AllocationPublic])
async def get_client_allocations(
    client_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    # Verificar se cliente existe
    client_stmt = select(Client).where(Client.id == client_id)
    client_result = await session.execute(client_stmt)
    client = client_result.scalars().first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Buscar alocações do cliente
    stmt = select(Allocation).where(Allocation.client_id == client_id)
    result = await session.execute(stmt)
    allocations = result.scalars().all()
    
    # Buscar dados dos assets e calcular totais
    allocation_list = []
    for allocation in allocations:
        asset_stmt = select(Asset).where(Asset.id == allocation.asset_id)
        asset_result = await session.execute(asset_stmt)
        asset = asset_result.scalars().first()
        
        allocation_list.append(AllocationPublic(
            **allocation.__dict__,
            asset_ticker=asset.ticker,
            asset_name=asset.name,
            client_name=client.name,
            total_invested=allocation.quantity * allocation.buy_price
        ))
    
    return allocation_list

@router.get("/allocations", response_model=List[AllocationPublic])
async def get_all_allocations(
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    # Buscar todas as alocações
    stmt = select(Allocation)
    result = await session.execute(stmt)
    allocations = result.scalars().all()
    
    # Buscar dados relacionados
    allocation_list = []
    for allocation in allocations:
        # Buscar asset
        asset_stmt = select(Asset).where(Asset.id == allocation.asset_id)
        asset_result = await session.execute(asset_stmt)
        asset = asset_result.scalars().first()
        
        # Buscar cliente
        client_stmt = select(Client).where(Client.id == allocation.client_id)
        client_result = await session.execute(client_stmt)
        client = client_result.scalars().first()
        
        allocation_list.append(AllocationPublic(
            **allocation.__dict__,
            asset_ticker=asset.ticker,
            asset_name=asset.name,
            client_name=client.name,
            total_invested=allocation.quantity * allocation.buy_price
        ))
    
    return allocation_list