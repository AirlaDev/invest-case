from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from contextlib import asynccontextmanager
import yfinance as yf
from enum import Enum


class MovementType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"


class MovementBase(BaseModel):
    client_id: int
    type: MovementType
    amount: float
    date: datetime
    note: Optional[str] = None

# Mock databases
clients_db = []
assets_db = []
allocations_db = []
current_client_id = 1
current_asset_id = 1
current_allocation_id = 1

# Add sample data
def add_sample_data():
    global clients_db, assets_db, allocations_db, current_client_id, current_asset_id, current_allocation_id
    
    # Sample clients
    sample_clients = [
        {"id": 1, "name": "João Silva", "email": "joao.silva@email.com", "is_active": True, "created_at": datetime.now()},
        {"id": 2, "name": "Maria Oliveira", "email": "maria.oliveira@email.com", "is_active": True, "created_at": datetime.now()},
        {"id": 3, "name": "Pedro Santos", "email": "pedro.santos@email.com", "is_active": False, "created_at": datetime.now()},
    ]
    clients_db.extend(sample_clients)
    current_client_id = len(sample_clients) + 1
    
    # Sample assets
    sample_assets = [
        {"id": 1, "ticker": "PETR4.SA", "name": "Petróleo Brasileiro S.A. - Petrobras", "exchange": "SAO", "currency": "BRL", "created_at": datetime.now()},
        {"id": 2, "ticker": "VALE3.SA", "name": "Vale S.A.", "exchange": "SAO", "currency": "BRL", "created_at": datetime.now()},
    ]
    assets_db.extend(sample_assets)
    current_asset_id = len(sample_assets) + 1
    
    # Sample allocations
    sample_allocations = [
        {"id": 1, "client_id": 1, "asset_id": 1, "quantity": 100, "buy_price": 35.50, "buy_date": datetime.now(), "created_at": datetime.now()},
        {"id": 2, "client_id": 2, "asset_id": 2, "quantity": 50, "buy_price": 68.90, "buy_date": datetime.now(), "created_at": datetime.now()},
    ]
    allocations_db.extend(sample_allocations)
    current_allocation_id = len(sample_allocations) + 1

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    add_sample_data()
    print("✅ Backend iniciado com dados de exemplo")
    yield
    # Shutdown
    print("🔴 Backend parado")

app = FastAPI(
    title="InvestCase API", 
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models Pydantic
class ClientBase(BaseModel):
    name: str
    email: str
    is_active: Optional[bool] = True

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

class AssetBase(BaseModel):
    ticker: str
    name: str
    exchange: Optional[str] = None
    currency: str = "BRL"

class AssetCreate(AssetBase):
    pass

class AssetPublic(AssetBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AllocationBase(BaseModel):
    client_id: int
    asset_id: int
    quantity: float
    buy_price: float
    buy_date: datetime

class AllocationCreate(AllocationBase):
    pass

class AllocationPublic(AllocationBase):
    id: int
    created_at: datetime
    asset_ticker: str
    asset_name: str
    client_name: str
    total_invested: float
    
    class Config:
        from_attributes = True

class MovementCreate(MovementBase):
    pass

class MovementPublic(MovementBase):
    id: int
    created_at: datetime
    client_name: str
    
    class Config:
        from_attributes = True

class MovementSummary(BaseModel):
    total_deposits: float
    total_withdrawals: float
    net_flow: float
    client_summary: List[dict]

# Mock database para movements
movements_db = []
current_movement_id = 1

# Adicione sample data para movements
def add_sample_data():
    global clients_db, assets_db, allocations_db, movements_db, current_client_id, current_asset_id, current_allocation_id, current_movement_id

# Sample movements
    sample_movements = [
        {"id": 1, "client_id": 1, "type": MovementType.DEPOSIT, "amount": 10000.00, "date": datetime.now(), "note": "Depósito inicial", "created_at": datetime.now()},
        {"id": 2, "client_id": 2, "type": MovementType.DEPOSIT, "amount": 5000.00, "date": datetime.now(), "note": "Aporte", "created_at": datetime.now()},
        {"id": 3, "client_id": 1, "type": MovementType.WITHDRAWAL, "amount": 2000.00, "date": datetime.now(), "note": "Retirada", "created_at": datetime.now()},
    ]
    movements_db.extend(sample_movements)
    current_movement_id = len(sample_movements) + 1

# Client Routes
@app.get("/")
async def root():
    return {"message": "InvestCase API está rodando!"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "clients_count": len(clients_db), "assets_count": len(assets_db)}

@app.get("/api/clients", response_model=ClientList)
async def list_clients(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    is_active: Optional[bool] = None
):
    filtered_clients = clients_db.copy()
    
    if search:
        filtered_clients = [
            c for c in filtered_clients 
            if search.lower() in c["name"].lower() or search.lower() in c["email"].lower()
        ]
    
    if is_active is not None:
        filtered_clients = [c for c in filtered_clients if c["is_active"] == is_active]
    
    total = len(filtered_clients)
    pages = (total + limit - 1) // limit
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    paginated_clients = filtered_clients[start_idx:end_idx]
    
    return ClientList(
        clients=paginated_clients,
        total=total,
        page=page,
        pages=pages
    )

@app.post("/api/clients", response_model=ClientPublic, status_code=201)
async def create_client(client_data: ClientCreate):
    global current_client_id
    
    if any(c["email"] == client_data.email for c in clients_db):
        raise HTTPException(status_code=400, detail="Este email já está cadastrado.")
    
    new_client = {
        "id": current_client_id,
        "name": client_data.name,
        "email": client_data.email,
        "is_active": client_data.is_active,
        "created_at": datetime.now()
    }
    clients_db.append(new_client)
    current_client_id += 1
    
    print(f"✅ Novo cliente criado: {new_client}")
    return new_client

# Asset Routes
@app.get("/api/assets", response_model=List[AssetPublic])
async def list_assets():
    return assets_db

@app.post("/api/assets/search/{ticker}", response_model=AssetPublic)
async def search_asset(ticker: str):
    global current_asset_id
    
    try:
        print(f"🔍 Buscando ativo: {ticker}")
        
        # Check if asset already exists
        existing_asset = next((a for a in assets_db if a["ticker"] == ticker.upper()), None)
        if existing_asset:
            print(f"📦 Ativo já existe: {existing_asset['ticker']}")
            return existing_asset
        
        # Search on Yahoo Finance
        stock = yf.Ticker(ticker)
        info = stock.info
        
        print(f"📊 Informações recebidas para {ticker}")
        
        # Create new asset
        new_asset = {
            "id": current_asset_id,
            "ticker": ticker.upper(),
            "name": info.get('longName', info.get('shortName', ticker.upper())),
            "exchange": info.get('exchange', ''),
            "currency": info.get('currency', 'BRL'),
            "created_at": datetime.now()
        }
        
        assets_db.append(new_asset)
        current_asset_id += 1
        
        print(f"🎉 Novo ativo criado: {new_asset}")
        return new_asset
        
    except Exception as e:
        print(f"❌ Erro ao buscar ativo {ticker}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erro ao buscar ativo {ticker}: {str(e)}")

# Allocation Routes
@app.get("/api/assets/allocations", response_model=List[AllocationPublic])
async def get_all_allocations():
    allocation_list = []
    
    for allocation in allocations_db:
        client = next((c for c in clients_db if c["id"] == allocation["client_id"]), None)
        asset = next((a for a in assets_db if a["id"] == allocation["asset_id"]), None)
        
        if client and asset:
            allocation_list.append(AllocationPublic(
                **allocation,
                asset_ticker=asset["ticker"],
                asset_name=asset["name"],
                client_name=client["name"],
                total_invested=allocation["quantity"] * allocation["buy_price"]
            ))
    
    return allocation_list

@app.get("/api/assets/clients/{client_id}/allocations", response_model=List[AllocationPublic])
async def get_client_allocations(client_id: int):
    client_allocations = [a for a in allocations_db if a["client_id"] == client_id]
    allocation_list = []
    
    for allocation in client_allocations:
        client = next((c for c in clients_db if c["id"] == allocation["client_id"]), None)
        asset = next((a for a in assets_db if a["id"] == allocation["asset_id"]), None)
        
        if client and asset:
            allocation_list.append(AllocationPublic(
                **allocation,
                asset_ticker=asset["ticker"],
                asset_name=asset["name"],
                client_name=client["name"],
                total_invested=allocation["quantity"] * allocation["buy_price"]
            ))
    
    return allocation_list

@app.post("/api/assets/allocations", response_model=AllocationPublic, status_code=201)
async def create_allocation(allocation_data: AllocationCreate):
    global current_allocation_id
    
    # Check if client exists
    client = next((c for c in clients_db if c["id"] == allocation_data.client_id), None)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Check if asset exists
    asset = next((a for a in assets_db if a["id"] == allocation_data.asset_id), None)
    if not asset:
        raise HTTPException(status_code=404, detail="Ativo não encontrado")
    
    # Create allocation
    new_allocation = {
        "id": current_allocation_id,
        "client_id": allocation_data.client_id,
        "asset_id": allocation_data.asset_id,
        "quantity": allocation_data.quantity,
        "buy_price": allocation_data.buy_price,
        "buy_date": allocation_data.buy_date,
        "created_at": datetime.now()
    }
    
    allocations_db.append(new_allocation)
    current_allocation_id += 1
    
    return AllocationPublic(
        **new_allocation,
        asset_ticker=asset["ticker"],
        asset_name=asset["name"],
        client_name=client["name"],
        total_invested=allocation_data.quantity * allocation_data.buy_price
    )

# Movement Routes
@app.get("/api/movements", response_model=List[MovementPublic])
async def get_movements(
    client_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    type: Optional[MovementType] = None
):
    filtered_movements = movements_db.copy()
    
    if client_id:
        filtered_movements = [m for m in filtered_movements if m["client_id"] == client_id]
    
    # Filtro por data (simplificado)
    if start_date:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        filtered_movements = [m for m in filtered_movements if m["date"] >= start]
    
    if end_date:
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        filtered_movements = [m for m in filtered_movements if m["date"] <= end]
    
    if type:
        filtered_movements = [m for m in filtered_movements if m["type"] == type]
    
    # Adicionar nome do cliente
    movement_list = []
    for movement in filtered_movements:
        client = next((c for c in clients_db if c["id"] == movement["client_id"]), None)
        movement_list.append(MovementPublic(
            **movement,
            client_name=client["name"] if client else "Cliente não encontrado"
        ))
    
    return movement_list

@app.post("/api/movements", response_model=MovementPublic, status_code=201)
async def create_movement(movement_data: MovementCreate):
    global current_movement_id
    
    # Verificar se cliente existe
    client = next((c for c in clients_db if c["id"] == movement_data.client_id), None)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    new_movement = {
        "id": current_movement_id,
        "client_id": movement_data.client_id,
        "type": movement_data.type,
        "amount": movement_data.amount,
        "date": movement_data.date,
        "note": movement_data.note,
        "created_at": datetime.now()
    }
    
    movements_db.append(new_movement)
    current_movement_id += 1
    
    return MovementPublic(
        **new_movement,
        client_name=client["name"]
    )

@app.get("/api/movements/summary", response_model=MovementSummary)
async def get_movements_summary(
    client_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    filtered_movements = movements_db.copy()
    
    if client_id:
        filtered_movements = [m for m in filtered_movements if m["client_id"] == client_id]
    
    # Calcular totais
    total_deposits = sum(m["amount"] for m in filtered_movements if m["type"] == MovementType.DEPOSIT)
    total_withdrawals = sum(m["amount"] for m in filtered_movements if m["type"] == MovementType.WITHDRAWAL)
    net_flow = total_deposits - total_withdrawals
    
    # Resumo por cliente
    client_summary = []
    if not client_id:
        for client in clients_db:
            client_movements = [m for m in filtered_movements if m["client_id"] == client["id"]]
            client_deposits = sum(m["amount"] for m in client_movements if m["type"] == MovementType.DEPOSIT)
            client_withdrawals = sum(m["amount"] for m in client_movements if m["type"] == MovementType.WITHDRAWAL)
            client_net_flow = client_deposits - client_withdrawals
            
            client_summary.append({
                "client_id": client["id"],
                "client_name": client["name"],
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


@app.post("/api/assets/allocations", response_model=AllocationPublic, status_code=201)
async def create_allocation(allocation_data: AllocationCreate):
    global current_allocation_id
    
    # Verificar se cliente existe
    client = next((c for c in clients_db if c["id"] == allocation_data.client_id), None)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Verificar se asset existe
    asset = next((a for a in assets_db if a["id"] == allocation_data.asset_id), None)
    if not asset:
        raise HTTPException(status_code=404, detail="Ativo não encontrado")
    
    # Criar alocação
    new_allocation = {
        "id": current_allocation_id,
        "client_id": allocation_data.client_id,
        "asset_id": allocation_data.asset_id,
        "quantity": allocation_data.quantity,
        "buy_price": allocation_data.buy_price,
        "buy_date": allocation_data.buy_date,
        "created_at": datetime.now()
    }
    
    allocations_db.append(new_allocation)
    current_allocation_id += 1
    
    return AllocationPublic(
        **new_allocation,
        asset_ticker=asset["ticker"],
        asset_name=asset["name"],
        client_name=client["name"],
        total_invested=allocation_data.quantity * allocation_data.buy_price
    )

@app.get("/api/assets/clients/{client_id}/allocations", response_model=List[AllocationPublic])
async def get_client_allocations(client_id: int):
    # Verificar se cliente existe
    client = next((c for c in clients_db if c["id"] == client_id), None)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    client_allocations = [a for a in allocations_db if a["client_id"] == client_id]
    allocation_list = []
    
    for allocation in client_allocations:
        asset = next((a for a in assets_db if a["id"] == allocation["asset_id"]), None)
        
        if asset:
            allocation_list.append(AllocationPublic(
                **allocation,
                asset_ticker=asset["ticker"],
                asset_name=asset["name"],
                client_name=client["name"],
                total_invested=allocation["quantity"] * allocation["buy_price"]
            ))
    
    return allocation_list

@app.get("/api/assets/allocations", response_model=List[AllocationPublic])
async def get_all_allocations():
    allocation_list = []
    
    for allocation in allocations_db:
        client = next((c for c in clients_db if c["id"] == allocation["client_id"]), None)
        asset = next((a for a in assets_db if a["id"] == allocation["asset_id"]), None)
        
        if client and asset:
            allocation_list.append(AllocationPublic(
                **allocation,
                asset_ticker=asset["ticker"],
                asset_name=asset["name"],
                client_name=client["name"],
                total_invested=allocation["quantity"] * allocation["buy_price"]
            ))
    
    return allocation_list

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)