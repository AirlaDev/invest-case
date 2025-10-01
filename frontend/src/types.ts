export interface Client {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Allocation {
  id: number;
  client_id: number;
  asset_id: number;
  quantity: number;
  buy_price: number;
  buy_date: string;
}

export interface Transaction {
    id: number;
    client_id: number;
    type: 'deposit' | 'withdrawal';
    amount: number;
    date: string;
    note?: string;
}

export interface Asset {
    id: number;
    ticker: string;
    name: string;
    type: string; 
    exchange: string;
    currency: string;
}