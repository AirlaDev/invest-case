'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Asset {
  id: number;
  ticker: string;
  name: string;
  exchange: string;
  currency: string;
  created_at: string;
}

interface Allocation {
  id: number;
  client_id: number;
  asset_id: number;
  quantity: number;
  buy_price: number;
  buy_date: string;
  asset_ticker: string;
  asset_name: string;
  client_name: string;
  total_invested: number;
}

interface Client {
  id: number;
  name: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTicker, setSearchTicker] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [newAllocation, setNewAllocation] = useState({
    client_id: '',
    asset_id: '',
    quantity: '',
    buy_price: '',
    buy_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAssets();
    fetchClients();
    fetchAllAllocations();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchClientAllocations(parseInt(selectedClient));
    } else {
      fetchAllAllocations();
    }
  }, [selectedClient]);

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assets/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (error) {
      console.error('Erro ao buscar ativos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clients/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || data);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const fetchClientAllocations = async (clientId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/assets/clients/${clientId}/allocations/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllocations(data);
      }
    } catch (error) {
      console.error('Erro ao buscar alocações do cliente:', error);
    }
  };

  const fetchAllAllocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assets/allocations/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllocations(data);
      }
    } catch (error) {
      console.error('Erro ao buscar todas as alocações:', error);
    }
  };

  const handleSearchAsset = async () => {
    if (!searchTicker.trim()) return;
    
    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/assets/search/${searchTicker}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const asset = await response.json();
        setAssets([asset, ...assets]);
        setSearchTicker('');
        alert('✅ Ativo encontrado e salvo com sucesso!');
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Erro ao buscar ativo'}`);
      }
    } catch (error) {
      console.error('Erro ao buscar ativo:', error);
      alert('❌ Erro ao buscar ativo. Verifique o ticker e tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assets/allocations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newAllocation,
          client_id: parseInt(newAllocation.client_id),
          asset_id: parseInt(newAllocation.asset_id),
          quantity: parseFloat(newAllocation.quantity),
          buy_price: parseFloat(newAllocation.buy_price)
        }),
      });

      if (response.ok) {
        setIsAllocationDialogOpen(false);
        setNewAllocation({
          client_id: '',
          asset_id: '',
          quantity: '',
          buy_price: '',
          buy_date: new Date().toISOString().split('T')[0]
        });
        
        // Atualizar a lista de alocações
        if (selectedClient) {
          fetchClientAllocations(parseInt(selectedClient));
        } else {
          fetchAllAllocations();
        }
        
        alert('✅ Alocação criada com sucesso!');
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Erro ao criar alocação'}`);
      }
    } catch (error) {
      console.error('Erro ao criar alocação:', error);
      alert('❌ Erro ao criar alocação');
    }
  };

  const totalInvested = allocations.reduce((sum, allocation) => sum + allocation.total_invested, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ativos Financeiros</h1>
        <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nova Alocação</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Alocação</DialogTitle>
              <DialogDescription>
                Associe um ativo a um cliente com os dados da compra
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAllocation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <select 
  value={newAllocation.client_id} 
  onChange={(e) => setNewAllocation({ ...newAllocation, client_id: e.target.value })}
  className="w-full p-2 border rounded-md"
  required
>
  <option value="">Selecione o cliente</option>
  {clients.map((client) => (
    <option key={client.id} value={client.id}>
      {client.name}
    </option>
  ))}
</select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset">Ativo *</Label>
                <select 
                  id="asset"
                  value={newAllocation.asset_id} 
                  onChange={(e) => setNewAllocation({ ...newAllocation, asset_id: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Selecione o ativo</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id.toString()}>
                      {asset.ticker} - {asset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    placeholder="0.0000"
                    value={newAllocation.quantity}
                    onChange={(e) => setNewAllocation({ ...newAllocation, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buy_price">Preço de Compra (R$) *</Label>
                  <Input
                    id="buy_price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={newAllocation.buy_price}
                    onChange={(e) => setNewAllocation({ ...newAllocation, buy_price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buy_date">Data da Compra *</Label>
                <Input
                  id="buy_date"
                  type="date"
                  value={newAllocation.buy_date}
                  onChange={(e) => setNewAllocation({ ...newAllocation, buy_date: e.target.value })}
                  required
                />
              </div>

              <DialogFooter>
                <Button 
                  type="submit"
                  disabled={!newAllocation.client_id || !newAllocation.asset_id || !newAllocation.quantity || !newAllocation.buy_price}
                >
                  Cadastrar Alocação
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Buscar Ativo no Yahoo Finance */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Ativo no Yahoo Finance</CardTitle>
          <CardDescription>
            Digite o ticker do ativo (ex: PETR4.SA, AAPL, BTC-USD, VALE3.SA, MGLU3.SA)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Ticker (ex: PETR4.SA, AAPL, BTC-USD)"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button 
              onClick={handleSearchAsset} 
              disabled={!searchTicker.trim() || isSearching}
            >
              {isSearching ? 'Buscando...' : 'Buscar Ativo'}
            </Button>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            <p>💡 Exemplos: PETR4.SA (Petrobras), VALE3.SA (Vale), AAPL (Apple), BTC-USD (Bitcoin)</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Ativos Cadastrados */}
        <Card>
          <CardHeader>
            <CardTitle>Ativos Cadastrados</CardTitle>
            <CardDescription>
              {assets.length} ativo(s) no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Bolsa</TableHead>
                    <TableHead>Moeda</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.ticker}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={asset.name}>
                        {asset.name}
                      </TableCell>
                      <TableCell>{asset.exchange || '-'}</TableCell>
                      <TableCell>{asset.currency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {assets.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum ativo cadastrado. Busque um ativo acima.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alocações */}
        <Card>
          <CardHeader>
            <CardTitle>Alocações de Ativos</CardTitle>
            <CardDescription>
              {allocations.length} alocação(ões) • Total Investido: R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filtro por Cliente */}
              <div className="flex gap-4">
                <select 
                  value={selectedClient} 
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Todos os clientes</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id.toString()}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tabela de Alocações */}
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead>Quant.</TableHead>
                      <TableHead>Preço Compra</TableHead>
                      <TableHead>Total Investido</TableHead>
                      <TableHead>Data Compra</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((allocation) => (
                      <TableRow key={allocation.id}>
                        <TableCell className="font-medium">
                          {allocation.client_name}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{allocation.asset_ticker}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                              {allocation.asset_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{allocation.quantity}</TableCell>
                        <TableCell>
                          R$ {allocation.buy_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {allocation.total_invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {new Date(allocation.buy_date).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {allocations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedClient ? 'Nenhuma alocação encontrada para este cliente' : 'Nenhuma alocação cadastrada'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}