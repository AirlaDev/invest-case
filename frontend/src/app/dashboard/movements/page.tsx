'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

      const response = await fetch(`/api/movements/?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        setMovements(await response.json());
      }
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clients/', {
        headers: { 'Authorization': `Bearer ${token}` }
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

      const response = await fetch(`/api/movements/summary/?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSummary(await response.json());
      }
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
    }
  };

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/movements/', {
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
        alert('Movimentação registrada!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Erro');
      }
    } catch (error) {
      alert('Erro ao registrar');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Movimentações</h1>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Entradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {summary.total_deposits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Saídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {summary.total_withdrawals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Fluxo Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.net_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {summary.net_flow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Movimentação</CardTitle>
            <CardDescription>Registre entrada ou saída</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMovement} className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <select
                  value={newMovement.client_id}
                  onChange={(e) => setNewMovement({ ...newMovement, client_id: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Selecione</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <select
                  value={newMovement.type}
                  onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value as 'deposit' | 'withdrawal' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="deposit">Entrada</option>
                  <option value="withdrawal">Saída</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newMovement.amount}
                  onChange={(e) => setNewMovement({ ...newMovement, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={newMovement.date}
                  onChange={(e) => setNewMovement({ ...newMovement, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Observação</Label>
                <Input
                  value={newMovement.note}
                  onChange={(e) => setNewMovement({ ...newMovement, note: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={!newMovement.client_id || !newMovement.amount}>
                Registrar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
            <CardDescription>{movements.length} movimentação(ões)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6 p-4 bg-muted rounded-lg">
              <select
                value={filters.client_id}
                onChange={(e) => setFilters({ ...filters, client_id: e.target.value })}
                className="flex-1 p-2 border rounded-md"
              >
                <option value="">Todos clientes</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="flex-1 p-2 border rounded-md"
              >
                <option value="">Todos tipos</option>
                <option value="deposit">Entradas</option>
                <option value="withdrawal">Saídas</option>
              </select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Nenhuma movimentação
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{new Date(movement.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{movement.client_name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          movement.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {movement.type === 'deposit' ? 'Entrada' : 'Saída'}
                        </span>
                      </TableCell>
                      <TableCell className={`font-semibold ${
                        movement.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        R$ {movement.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}