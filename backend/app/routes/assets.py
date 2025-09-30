from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Asset, Allocation, Client
from app.schemas import Asset as AssetSchema, AllocationCreate, AllocationSchema
import yfinance as yf

router = APIRouter()

@router.get("/search/{ticker}", response_model=AssetSchema)
def search_asset(ticker: str, db: Session = Depends(get_db)):
    db_asset = db.query(Asset).filter(Asset.ticker == ticker.upper()).first()
    if db_asset:
        return db_asset

    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        asset_data = {
            "ticker": ticker.upper(),
            "name": info.get("longName", ""),
            "exchange": info.get("exchange", ""),
            "currency": info.get("currency", "BRL"),
        }
        new_asset = Asset(**asset_data)
        db.add(new_asset)
        db.commit()
        db.refresh(new_asset)
        return new_asset
    except Exception:
        raise HTTPException(status_code=404, detail="Ativo não encontrado")

@router.post("/allocations/{client_id}", response_model=AllocationSchema)
def create_allocation(client_id: int, allocation_data: AllocationCreate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    asset = db.query(Asset).filter(Asset.id == allocation_data.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Ativo não encontrado")

    new_allocation = Allocation(
        client_id=client_id,
        asset_id=allocation_data.asset_id,
        quantity=allocation_data.quantity,
        buy_price=allocation_data.buy_price,
        buy_date=allocation_data.buy_date,
    )
    db.add(new_allocation)
    db.commit()
    db.refresh(new_allocation)
    return new_allocation

@router.get("/allocations/{client_id}", response_model=list[AllocationSchema])
def list_client_allocations(client_id: int, db: Session = Depends(get_db)):
    allocations = db.query(Allocation).filter(Allocation.client_id == client_id).all()
    return allocations