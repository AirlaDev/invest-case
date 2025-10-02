'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Movement {
  id: number;
  client_id: number;
  client_name: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  note?: string;
}

interface MovementSummary {
  total_deposits: number;
  total_withdrawals: number;
  net_flow: number;
  client_summary: Array<{
    client_id: number;
    client_name: string;
    total_deposits: number;
    total_withdrawals: number;
    net_flow: number;
  }>;
}

interface Client {
  id: number;
  name: string;
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [summary, setSummary] = useState<MovementSummary | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    client_id: '',
    start_date: '',
    end_date: '',
    type: ''
  });
  const [newMovement, setNewMovement] = useState({
    client_id: '',
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    fetchMovements();
    fetchClients();
    fetchSummary();
  }, [filters]);

  const fetchMovements = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.client_id) params.append('client_id', filters.client_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.type) params.append('type', filters.type);

      const response = await fetch(`/api/movements?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
      } else {
        console.error('Erro ao buscar movimentações:', await response.text());
        setMovements([]);
      }
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clients', {
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

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.client_id) params.append('client_id', filters.client_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await fetch(`/api/movements/summary?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
    }
  };

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newMovement,
          client_id: parseInt(newMovement.client_id),
          amount: parseFloat(newMovement.amount)
        }),
      });

      if (response.ok) {
        setNewMovement({
          client_id: '',
          type: 'deposit',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          note: ''
        });
        fetchMovements();
        fetchSummary();
        alert('✅ Movimentação registrada com sucesso!');
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Erro ao registrar movimentação'}`);
      }
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      alert('❌ Erro ao registrar movimentação');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Carregando movimentações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Movimentações</h1>
      </div>

      {/* Resumo */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {summary.total_deposits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {summary.total_withdrawals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Fluxo Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                summary.net_flow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                R$ {summary.net_flow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.client_summary.length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Nova Movimentação */}
        <Card>
          <CardHeader>
            <CardTitle>Nova Movimentação</CardTitle>
            <CardDescription>
              Registre uma nova entrada ou saída
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMovement} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <select 
                  id="client"
                  value={newMovement.client_id} 
                  onChange={(e) => setNewMovement({ ...newMovement, client_id: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Selecione o cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id.toString()}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <select 
                  id="type"
                  value={newMovement.type} 
                  onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value as 'deposit' | 'withdrawal' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="deposit">Entrada (Depósito)</option>
                  <option value="withdrawal">Saída (Retirada)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={newMovement.amount}
                  onChange={(e) => setNewMovement({ ...newMovement, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  type="date"
                  value={newMovement.date}
                  onChange={(e) => setNewMovement({ ...newMovement, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Observação</Label>
                <Input
                  placeholder="Observação (opcional)"
                  value={newMovement.note}
                  onChange={(e) => setNewMovement({ ...newMovement, note: e.target.value })}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!newMovement.client_id || !newMovement.amount}
              >
                Registrar Movimentação
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista e Filtros */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Histórico de Movimentações</CardTitle>
            <CardDescription>
              {movements.length} movimentação(ões) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-muted rounded-lg">
              <div className="flex-1">
                <Label htmlFor="filter-client" className="text-sm">Cliente</Label>
                <select 
                  id="filter-client"
                  value={filters.client_id} 
                  onChange={(e) => setFilters({ ...filters, client_id: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Todos clientes</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id.toString()}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <Label htmlFor="filter-type" className="text-sm">Tipo</Label>
                <select 
                  id="filter-type"
                  value={filters.type} 
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Todos tipos</option>
                  <option value="deposit">Entradas</option>
                  <option value="withdrawal">Saídas</option>
                </select>
              </div>

              <div className="flex gap-2 flex-1">
                <div className="flex-1">
                  <Label htmlFor="start-date" className="text-sm">Data Início</Label>
                  <Input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="end-date" className="text-sm">Data Fim</Label>
                  <Input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Tabela */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor (R$)</TableHead>
                    <TableHead>Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhuma movimentação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="font-medium">
                          {formatDate(movement.date)}
                        </TableCell>
                        <TableCell>{movement.client_name}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            movement.type === 'deposit' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {movement.type === 'deposit' ? 'Entrada' : 'Saída'}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          movement.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          R$ {movement.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {movement.note || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}