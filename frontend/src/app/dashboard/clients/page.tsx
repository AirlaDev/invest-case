'use client'

import { useState } from 'react'
import { mockClients } from '@/lib/mock-data'
import { Client } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Users, UserPlus, UserCheck } from 'lucide-react'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
  })

  const filteredClients = clients.filter(client => {
    const name = client.name || ''
    const email = client.email || ''
    const cpf = client.cpf || ''
    
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cpf.includes(searchTerm)
    )
  })

  const handleAddClient = () => {
    if (!newClient.name || !newClient.email) {
      alert('Nome e email são obrigatórios!')
      return
    }

    const client: Client = {
      id: String(clients.length + 1),
      name: newClient.name.trim(),
      email: newClient.email.trim(),
      cpf: newClient.cpf.trim(),
      phone: newClient.phone.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    }
    setClients([...clients, client])
    setNewClient({ name: '', email: '', cpf: '', phone: '' })
    setIsAddDialogOpen(false)
  }

  const getInitials = (name: string) => {
    if (!name) return '??'
    return name
      .split(' ')
      .map(part => part[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const totalClients = clients.length
  const newThisMonth = clients.filter(c => {
    try {
      const clientDate = new Date(c.createdAt)
      const now = new Date()
      return clientDate.getMonth() === now.getMonth() &&
             clientDate.getFullYear() === now.getFullYear()
    } catch {
      return false
    }
  }).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os clientes do escritório
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Adicionar Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nome Completo *</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="bg-white border-gray-300 focus:border-blue-500"
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="bg-white border-gray-300 focus:border-blue-500"
                  placeholder="cliente@email.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
                  <Input
                    id="cpf"
                    value={newClient.cpf}
                    onChange={(e) => setNewClient({ ...newClient, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="bg-white border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                  <Input
                    id="phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="bg-white border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddClient} 
                className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
              >
                Adicionar Cliente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalClients}</div>
            <p className="text-xs text-gray-500 mt-1">+2 desde o último mês</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Novos este Mês</CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{newThisMonth}</div>
            <p className="text-xs text-gray-500 mt-1">+1 desde a última semana</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clientes Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalClients}</div>
            <p className="text-xs text-gray-500 mt-1">100% do total</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-700 text-sm font-medium">
                              {getInitials(client.name)}
                            </span>
                          </div>
                          {client.name || 'Nome não informado'}
                        </div>
                      </TableCell>
                      <TableCell>{client.email || 'Email não informado'}</TableCell>
                      <TableCell>{client.cpf || 'CPF não informado'}</TableCell>
                      <TableCell>{client.phone || 'Telefone não informado'}</TableCell>
                      <TableCell>
                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : 'Data inválida'}
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
  )
}