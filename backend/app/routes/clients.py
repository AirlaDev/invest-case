from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Client
from app.schemas import Client as ClientSchema, ClientCreate

router = APIRouter()

@router.get("/", response_model=list[ClientSchema])
def list_clients(db: Session = Depends(get_db)):
    return db.query(Client).all()

@router.post("/", response_model=ClientSchema)
def create_client(client_data: ClientCreate, db: Session = Depends(get_db)):
    
    if db.query(Client).filter(Client.email == client_data.email).first():
        raise HTTPException(status_code=400, detail="Email já existe")
    
    new_client = Client(
        name=client_data.name,
        email=client_data.email
    )
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return new_client

@router.get("/{client_id}", response_model=ClientSchema)
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return client

@router.put("/{client_id}", response_model=ClientSchema)
def update_client(client_id: int, client_data: ClientCreate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    client.name = client_data.name
    client.email = client_data.email
    
    db.commit()
    return client

@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    client.is_active = False
    db.commit()
    return {"message": "Cliente desativado"}