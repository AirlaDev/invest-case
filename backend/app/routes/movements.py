from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Movement, Client
from app.schemas import MovementCreate, MovementSchema
from datetime import datetime

router = APIRouter()

@router.post("/{client_id}", response_model=MovementSchema)
def create_movement(client_id: int, movement_data: MovementCreate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    new_movement = Movement(
        client_id=client_id,
        type=movement_data.type,
        amount=movement_data.amount,
        note=movement_data.note,
    )
    db.add(new_movement)
    db.commit()
    db.refresh(new_movement)
    return new_movement

@router.get("/{client_id}", response_model=list[MovementSchema])
def get_client_movements(
    client_id: int,
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db)
):
    query = db.query(Movement).filter(Movement.client_id == client_id)
    if start_date:
        query = query.filter(Movement.date >= start_date)
    if end_date:
        query = query.filter(Movement.date <= end_date)
    return query.all()

@router.get("/office_total", response_model=float)
def get_office_total(db: Session = Depends(get_db)):
    total_deposits = db.query(func.sum(Movement.amount)).filter(Movement.type == "deposit").scalar() or 0
    total_withdrawals = db.query(func.sum(Movement.amount)).filter(Movement.type == "withdrawal").scalar() or 0
    return total_deposits - total_withdrawals