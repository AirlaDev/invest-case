// frontend/src/app/dashboard/allocations/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Allocation, Client, Asset } from '@/types'; // Tipos atualizados

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Buscando todos os dados necessários em paralelo
        const [allocationsRes, clientsRes, assetsRes] = await Promise.all([
          fetch('/api/assets/allocations'),
          fetch('/api/clients'),
          fetch('/api/assets')
        ]);

        if (allocationsRes.ok) {
          const data = await allocationsRes.json();
          setAllocations(data);
        }
        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.clients || data);
        }
        if (assetsRes.ok) {
          const data = await assetsRes.json();
          setAssets(data);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alocações</h1>
          <p className="text-muted-foreground">Visualize as alocações de ativos dos clientes</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Todas as Alocações</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço de Compra</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((allocation) => {
                const client = clients.find(c => c.id === allocation.client_id);
                const asset = assets.find(a => a.id === allocation.asset_id);
                return (
                  <TableRow key={allocation.id}>
                    <TableCell>{client?.name}</TableCell>
                    <TableCell>{asset?.name}</TableCell>
                    <TableCell>{allocation.quantity}</TableCell>
                    <TableCell>{formatCurrency(allocation.buy_price)}</TableCell>
                    <TableCell>{new Date(allocation.buy_date).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}