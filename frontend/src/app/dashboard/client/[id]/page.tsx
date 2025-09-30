'use client'
import { ReactNode, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Briefcase, Landmark, TrendingUp, TrendingDown, Search, Plus, Filter } from 'lucide-react'

// Interfaces para tipagem dos dados
interface Client {
  id: number;
  name: string;
  email: string;
}
interface Allocation {
  id: number;
  asset_id: number;
  quantity: number;
  buy_price: number;
  buy_date: string;
}
interface Movement {
  id: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  note: string;
}
interface Asset {
    currency: ReactNode;
    exchange: ReactNode;
    id: number;
    ticker: string;
    name: string;
}

export default function ClientDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params

  const [client, setClient] = useState<Client | null>(null)
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [activeTab, setActiveTab] = useState('allocations')

  // Estado para os formulários
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [ticker, setTicker] = useState('')
  const [foundAsset, setFoundAsset] = useState<Asset | null>(null);
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [movementType, setMovementType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementNote, setMovementNote] = useState('');
  
  // Estado para filtros de data
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');


  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !id) {
      router.push('/')
      return
    }
    fetchClientDetails()
    fetchAllocations()
    fetchMovements()
  }, [id, router])

  const fetchClientDetails = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:8000/api/clients/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) setClient(await response.json())
  }

  const fetchAllocations = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:8000/api/assets/allocations/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) setAllocations(await response.json());
  };

  const fetchMovements = async () => {
    const token = localStorage.getItem('token');
    let url = `http://localhost:8000/api/movements/${id}`;
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', new Date(startDate).toISOString());
    if (endDate) queryParams.append('end_date', new Date(endDate).toISOString());
    if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
    }

    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) setMovements(await response.json());
  };
  
  const handleSearchAsset = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:8000/api/assets/search/${ticker}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(response.ok) {
            const assetData = await response.json();
            setFoundAsset(assetData);
        } else {
            alert('Ativo não encontrado.');
            setFoundAsset(null);
        }
    } catch (error) {
        alert('Erro ao buscar ativo.');
    }
  };

  const handleAddAllocation = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!foundAsset) {
          alert('Por favor, busque e encontre um ativo válido primeiro.');
          return;
      }
      const token = localStorage.getItem('token');
      try {
          const response = await fetch(`http://localhost:8000/api/assets/allocations/${id}`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  asset_id: foundAsset.id,
                  quantity: parseFloat(quantity),
                  buy_price: parseFloat(buyPrice),
                  buy_date: new Date().toISOString()
              })
          });
          if(response.ok) {
              fetchAllocations();
              setShowAllocationModal(false);
              // Reset form
              setTicker('');
              setFoundAsset(null);
              setQuantity('');
              setBuyPrice('');
              alert('Alocação adicionada com sucesso!');
          } else {
              alert('Falha ao adicionar alocação.');
          }
      } catch (error) {
          alert('Erro ao criar alocação.');
      }
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:8000/api/movements/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: movementType,
                amount: parseFloat(movementAmount),
                note: movementNote
            })
        });
        if(response.ok) {
            fetchMovements();
            setShowMovementModal(false);
            // Reset form
            setMovementType('deposit');
            setMovementAmount('');
            setMovementNote('');
            alert('Movimentação registrada com sucesso!');
        } else {
            alert('Falha ao registrar movimentação.');
        }
    } catch (error) {
        alert('Erro ao registrar movimentação.');
    }
  };
  
  const clientNetWorth = movements.reduce((acc, mov) => {
      return mov.type === 'deposit' ? acc + mov.amount : acc - mov.amount;
  }, 0);

  if (!client) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Voltar para o Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-gray-500">{client.email}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Abas */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab('allocations')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'allocations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <Briefcase className="inline-block mr-2" size={16} /> Alocações
            </button>
            <button onClick={() => setActiveTab('movements')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'movements' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              <Landmark className="inline-block mr-2" size={16} /> Movimentações
            </button>
          </nav>
        </div>

        {/* Conteúdo da Aba */}
        {activeTab === 'allocations' && (
          <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Alocações de Ativos</h2>
                <button onClick={() => setShowAllocationModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                    <Plus size={16} className="mr-2"/> Nova Alocação
                </button>
            </div>
            {/* Tabela de Alocações */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                {allocations.length > 0 ? (
                    <p>Tabela de alocações aqui.</p>
                ) : (
                    <p className="text-center text-gray-500">Nenhuma alocação encontrada.</p>
                )}
            </div>
          </div>
        )}

        {activeTab === 'movements' && (
          <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Movimentações Financeiras</h2>
                <button onClick={() => setShowMovementModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
                    <Plus size={16} className="mr-2"/> Nova Movimentação
                </button>
            </div>
            {/* Card de Captação */}
             <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-600">Captação Líquida do Cliente</h3>
                <p className={`text-3xl font-bold ${clientNetWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(clientNetWorth)}
                </p>
            </div>

            {/* Filtros de Data */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex items-center space-x-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data Inicial</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data Final</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                </div>
                <button onClick={fetchMovements} className="self-end bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                    <Filter size={16} className="mr-2"/> Filtrar
                </button>
            </div>
            
            {/* Tabela de Movimentações */}
             <div className="bg-white rounded-xl shadow-sm border">
                {movements.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {movements.map(mov => (
                                <tr key={mov.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {mov.type === 'deposit' ? <TrendingUp className="text-green-500 inline-block mr-2" /> : <TrendingDown className="text-red-500 inline-block mr-2" />}
                                        {mov.type === 'deposit' ? 'Depósito' : 'Saque'}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${mov.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mov.amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(mov.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{mov.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-500 p-6">Nenhuma movimentação encontrada para o período.</p>
                )}
            </div>
          </div>
        )}
      </main>

       {/* Modal Nova Alocação */}
       {showAllocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Nova Alocação</h3>
                <form onSubmit={handleAddAllocation}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Ticker do Ativo</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input type="text" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Ex: PETR4"/>
                            <button type="button" onClick={handleSearchAsset} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
                                <Search size={20}/>
                            </button>
                        </div>
                    </div>
                    {foundAsset && (
                        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                            <p className="font-semibold">{foundAsset.name} ({foundAsset.ticker})</p>
                            <p className="text-sm text-gray-600">{foundAsset.exchange} - {foundAsset.currency}</p>
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg mt-1" required/>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">Preço de Compra (por unidade)</label>
                        <input type="number" step="0.01" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg mt-1" required/>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={() => setShowAllocationModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Salvar Alocação</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Modal Nova Movimentação */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                 <h3 className="text-lg font-semibold mb-4">Nova Movimentação</h3>
                 <form onSubmit={handleAddMovement}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select value={movementType} onChange={e => setMovementType(e.target.value as any)} className="w-full p-2 border border-gray-300 rounded-lg mt-1">
                            <option value="deposit">Depósito (Entrada)</option>
                            <option value="withdrawal">Saque (Saída)</option>
                        </select>
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Valor</label>
                        <input type="number" step="0.01" value={movementAmount} onChange={e => setMovementAmount(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg mt-1" required/>
                    </div>
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">Nota (Opcional)</label>
                        <input type="text" value={movementNote} onChange={e => setMovementNote(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg mt-1"/>
                    </div>
                     <div className="flex justify-end space-x-3">
                        <button type="button" onClick={() => setShowMovementModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Salvar Movimentação</button>
                    </div>
                 </form>
            </div>
        </div>
      )}

    </div>
  )
}