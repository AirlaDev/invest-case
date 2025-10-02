import { Client, Allocation, Transaction, Asset } from '@/types'; 

export const mockClients: Omit<Client, 'is_active' | 'created_at'>[] = [
  {
      id: 1, name: 'João Silva', email: 'joao.silva@example.com',
      cpf: '',
      phone: ''
  },
  {
      id: 2, name: 'Maria Oliveira', email: 'maria.o@example.com',
      phone: '',
      cpf: ''
  },
];

export const mockAssets: Asset[] = [
    { id: 1, ticker: 'PETR4', name: 'Petrobras PN', type: 'Ação', exchange: 'B3', currency: 'BRL' },
    { id: 2, ticker: 'MXRF11', name: 'Maxi Renda FII', type: 'Fundo Imobiliário', exchange: 'B3', currency: 'BRL' },
];

export const mockAllocations: Allocation[] = [
  { id: 1, client_id: 1, asset_id: 1, quantity: 100, buy_price: 30.50, buy_date: '2025-03-10' },
  { id: 2, client_id: 2, asset_id: 2, quantity: 200, buy_price: 10.20, buy_date: '2025-04-05' },
];

export const mockTransactions: Transaction[] = [
  { id: 1, client_id: 1, type: 'deposit', amount: 5000, date: '2025-03-01', note: 'Aporte inicial' },
  { id: 2, client_id: 2, type: 'deposit', amount: 3000, date: '2025-04-01', note: 'Aporte inicial' },
  { id: 3, client_id: 1, type: 'withdrawal', amount: 500, date: '2025-05-15', note: 'Retirada para despesas' },
];