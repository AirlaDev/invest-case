from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_session 
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientPublic 

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.post("/", response_model=ClientPublic, status_code=201)
async def create_client(client_data: ClientCreate, session: AsyncSession = Depends(get_session)):
    stmt = select(Client).where(Client.email == client_data.email)
    existing_client = await session.execute(stmt)
    if existing_client.scalars().first():
        raise HTTPException(status_code=400, detail="Este email já está cadastrado.")

    new_client = Client(name=client_data.name, email=client_data.email)
    session.add(new_client)
    await session.commit()
    await session.refresh(new_client)
    return new_client

@router.get("/", response_model=List[ClientPublic])
async def list_clients(
    session: AsyncSession = Depends(get_session),
    search: Optional[str] = Query(None)
):
    query = select(Client).order_by(Client.id)
    if search:
        query = query.where(Client.name.ilike(f"%{search}%"))

    result = await session.execute(query)
    return result.scalars().all()