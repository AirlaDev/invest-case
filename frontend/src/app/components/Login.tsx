'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.access_token)
        router.push('/dashboard')
      } else {
        alert('Email ou senha inválidos')
      }
    } catch (error) {
      alert('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  
  const setupInitialUser = async () => {
    try {
      await fetch('http://localhost:8000/api/auth/setup', {
        method: 'POST',
      })
      alert('Usuário admin criado: admin@invest.com / admin123')
    } catch (error) {
      alert('Erro ao criar usuário')
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 className="text-2xl font-bold mb-6 text-center">InvestFlow</h1>
      
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <button
        onClick={setupInitialUser}
        className="w-full mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 text-sm"
      >
        Criar Usuário Inicial
      </button>
    </div>
  )
}