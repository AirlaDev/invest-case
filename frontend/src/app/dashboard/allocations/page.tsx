// frontend/src/app/dashboard/allocations/page.tsx
'use client';
import { useState } from 'react';
import { mockAllocations, mockClients, mockAssets } from '@/lib/mock-data';
import { Allocation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


export default function AllocationsPage() {
  const [allocations] = useState<Allocation[]>(mockAllocations);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

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
                const client = mockClients.find(c => c.id === allocation.client_id);
                const asset = mockAssets.find(a => a.id === allocation.asset_id);
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