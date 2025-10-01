// frontend/src/app/dashboard/transactions/page.tsx
'use client';
import { useState, useMemo } from 'react';
import { mockTransactions, mockClients } from '@/lib/mock-data';
import { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// CORREÇÃO: Usando export default
export default function TransactionsPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions);

  const stats = useMemo(() => {
    const entradas = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const saidas = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
    return {
      totalEntradas: entradas,
      totalSaidas: saidas,
      saldoLiquido: entradas - saidas,
    };
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Captação (Entradas e Saídas)</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total de Entradas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl text-green-600">{formatCurrency(stats.totalEntradas)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total de Saídas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl text-red-600">{formatCurrency(stats.totalSaidas)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Saldo Líquido</CardTitle></CardHeader>
          <CardContent><p className="text-2xl">{formatCurrency(stats.saldoLiquido)}</p></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Histórico de Transações</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const client = mockClients.find((c: { id: number; }) => c.id === transaction.client_id);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{client?.name}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'deposit' ? 'default' : 'destructive'}>
                        {transaction.type === 'deposit' ? <ArrowUpCircle className="h-4 w-4 mr-2" /> : <ArrowDownCircle className="h-4 w-4 mr-2" />}
                        {transaction.type === 'deposit' ? 'Depósito' : 'Retirada'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR')}</TableCell>
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