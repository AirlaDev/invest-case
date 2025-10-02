from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from math import ceil

from app.database import get_session 
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientPublic, ClientList
from app.auth.dependencies import get_current_user

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class ClientBase(BaseModel):
    name: str
    email: str
    is_active: bool = True

class ClientCreate(ClientBase):
    pass

class ClientPublic(ClientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ClientList(BaseModel):
    clients: List[ClientPublic]
    total: int
    page: int
    pages: int

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.get("/", response_model=ClientList)
async def list_clients(
    session: AsyncSession = Depends(get_session),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    # Query base
    query = select(Client)
    count_query = select(func.count(Client.id))
    
    # Aplicar filtros
    if search:
        search_filter = Client.name.ilike(f"%{search}%") | Client.email.ilike(f"%{search}%")
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)
    
    if is_active is not None:
        query = query.where(Client.is_active == is_active)
        count_query = count_query.where(Client.is_active == is_active)
    
    # Calcular paginação
    total_result = await session.execute(count_query)
    total = total_result.scalar()
    pages = ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    
    # Executar query com paginação
    query = query.order_by(Client.id).offset(offset).limit(limit)
    result = await session.execute(query)
    clients = result.scalars().all()
    
    return ClientList(
        clients=clients,
        total=total,
        page=page,
        pages=pages
    )

@router.post("/", response_model=ClientPublic, status_code=201)
async def create_client(
    client_data: ClientCreate, 
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    # Verificar se email já existe
    stmt = select(Client).where(Client.email == client_data.email)
    existing_client = await session.execute(stmt)
    if existing_client.scalars().first():
        raise HTTPException(status_code=400, detail="Este email já está cadastrado.")

    new_client = Client(
        name=client_data.name, 
        email=client_data.email,
        is_active=client_data.is_active
    )
    session.add(new_client)
    await session.commit()
    await session.refresh(new_client)
    return new_client

@router.get("/{client_id}", response_model=ClientPublic)
async def get_client(
    client_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    stmt = select(Client).where(Client.id == client_id)
    result = await session.execute(stmt)
    client = result.scalars().first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    return client

@router.put("/{client_id}", response_model=ClientPublic)
async def update_client(
    client_id: int,
    client_data: ClientCreate,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    stmt = select(Client).where(Client.id == client_id)
    result = await session.execute(stmt)
    client = result.scalars().first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    # Verificar se o email já existe em outro cliente
    if client_data.email != client.email:
        email_stmt = select(Client).where(Client.email == client_data.email, Client.id != client_id)
        existing_email = await session.execute(email_stmt)
        if existing_email.scalars().first():
            raise HTTPException(status_code=400, detail="Este email já está cadastrado.")

    client.name = client_data.name
    client.email = client_data.email
    client.is_active = client_data.is_active
    
    await session.commit()
    await session.refresh(client)
    return client

@router.delete("/{client_id}")
async def delete_client(
    client_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    stmt = select(Client).where(Client.id == client_id)
    result = await session.execute(stmt)
    client = result.scalars().first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    await session.delete(client)
    await session.commit()
    
    return {"message": "Cliente deletado com sucesso"}

@router.patch("/{client_id}/activate", response_model=ClientPublic)
async def activate_client(
    client_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Ativar cliente"""
    stmt = select(Client).where(Client.id == client_id)
    result = await session.execute(stmt)
    client = result.scalars().first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    client.is_active = True
    await session.commit()
    await session.refresh(client)
    
    return client

@router.patch("/{client_id}/inactivate", response_model=ClientPublic)
async def inactivate_client(
    client_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Inativar cliente"""
    stmt = select(Client).where(Client.id == client_id)
    result = await session.execute(stmt)
    client = result.scalars().first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    client.is_active = False
    await session.commit()
    await session.refresh(client)
    
    return client