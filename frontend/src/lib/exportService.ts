import { utils, writeFile } from 'xlsx';

interface ExportData {
  clients?: any[];
  movements?: any[];
  allocations?: any[];
}

export class ExportService {
  static exportToExcel(data: ExportData, filename: string) {
    const workbook = utils.book_new();

    if (data.clients && data.clients.length > 0) {
      const clientsSheet = utils.json_to_sheet(data.clients.map(client => ({
        'ID': client.id,
        'Nome': client.name,
        'Email': client.email,
        'Status': client.is_active ? 'Ativo' : 'Inativo',
        'Data Cadastro': new Date(client.created_at).toLocaleDateString('pt-BR')
      })));
      utils.book_append_sheet(workbook, clientsSheet, 'Clientes');
    }

    if (data.movements && data.movements.length > 0) {
      const movementsSheet = utils.json_to_sheet(data.movements.map(movement => ({
        'ID': movement.id,
        'Cliente': movement.client_name,
        'Tipo': movement.type === 'deposit' ? 'Entrada' : 'Saída',
        'Valor (R$)': movement.amount,
        'Data': new Date(movement.date).toLocaleDateString('pt-BR'),
        'Observação': movement.note || ''
      })));
      utils.book_append_sheet(workbook, movementsSheet, 'Movimentações');
    }

    if (data.allocations && data.allocations.length > 0) {
      const allocationsSheet = utils.json_to_sheet(data.allocations.map(allocation => ({
        'ID': allocation.id,
        'Cliente': allocation.client_name,
        'Ativo': allocation.asset_ticker,
        'Nome do Ativo': allocation.asset_name,
        'Quantidade': allocation.quantity,
        'Preço de Compra (R$)': allocation.buy_price,
        'Data da Compra': new Date(allocation.buy_date).toLocaleDateString('pt-BR'),
        'Valor Total (R$)': allocation.quantity * allocation.buy_price
      })));
      utils.book_append_sheet(workbook, allocationsSheet, 'Alocações');
    }

    writeFile(workbook, `${filename}.xlsx`);
  }

  static exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}