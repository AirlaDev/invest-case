from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, date
from typing import List, Optional

from app.database import get_session 
from app.models.movement import Movement, MovementType
from app.models.client import Client
from app.schemas.movement import MovementCreate, MovementPublic, MovementSummary
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/movements", tags=["Movements"])

@router.post("/", response_model=MovementPublic)
async def create_movement(
    movement_data: MovementCreate,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    # Verificar se cliente existe
    client_stmt = select(Client).where(Client.id == movement_data.client_id)
    client_result = await session.execute(client_stmt)
    client = client_result.scalars().first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    new_movement = Movement(**movement_data.dict())
    session.add(new_movement)
    await session.commit()
    await session.refresh(new_movement)
    
    return MovementPublic(
        **new_movement.__dict__,
        client_name=client.name
    )

@router.get("/", response_model=List[MovementPublic])
async def get_movements(
    session: AsyncSession = Depends(get_session),
    client_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    type: Optional[MovementType] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    query = select(Movement)
    
    if client_id:
        query = query.where(Movement.client_id == client_id)
    
    if start_date:
        query = query.where(Movement.date >= start_date)
    
    if end_date:
        query = query.where(Movement.date <= end_date)
    
    if type:
        query = query.where(Movement.type == type)
    
    query = query.order_by(Movement.date.desc())
    result = await session.execute(query)
    movements = result.scalars().all()
    
    # Buscar nomes dos clientes
    movement_list = []
    for movement in movements:
        client_stmt = select(Client).where(Client.id == movement.client_id)
        client_result = await session.execute(client_stmt)
        client = client_result.scalars().first()
        
        movement_list.append(MovementPublic(
            **movement.__dict__,
            client_name=client.name
        ))
    
    return movement_list

@router.get("/summary", response_model=MovementSummary)
async def get_movements_summary(
    session: AsyncSession = Depends(get_session),
    client_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    # Query base
    query = select(Movement)
    
    if client_id:
        query = query.where(Movement.client_id == client_id)
    
    if start_date:
        query = query.where(Movement.date >= start_date)
    
    if end_date:
        query = query.where(Movement.date <= end_date)
    
    result = await session.execute(query)
    movements = result.scalars().all()
    
    # Calcular totais
    total_deposits = sum(m.amount for m in movements if m.type == MovementType.DEPOSIT)
    total_withdrawals = sum(m.amount for m in movements if m.type == MovementType.WITHDRAWAL)
    net_flow = total_deposits - total_withdrawals
    
    # Resumo por cliente
    client_summary = []
    if not client_id:
        # Buscar todos os movimentos agrupados por cliente
        client_stmt = select(Client)
        client_result = await session.execute(client_stmt)
        clients = client_result.scalars().all()
        
        for client in clients:
            client_movements = [m for m in movements if m.client_id == client.id]
            client_deposits = sum(m.amount for m in client_movements if m.type == MovementType.DEPOSIT)
            client_withdrawals = sum(m.amount for m in client_movements if m.type == MovementType.WITHDRAWAL)
            client_net_flow = client_deposits - client_withdrawals
            
            client_summary.append({
                "client_id": client.id,
                "client_name": client.name,
                "total_deposits": client_deposits,
                "total_withdrawals": client_withdrawals,
                "net_flow": client_net_flow
            })
    
    return MovementSummary(
        total_deposits=total_deposits,
        total_withdrawals=total_withdrawals,
        net_flow=net_flow,
        client_summary=client_summary
    )