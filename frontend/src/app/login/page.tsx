'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthProviderWrapper } from '@/providers/AuthProviderWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowRight, Mail } from "lucide-react"

function LoginContent() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Tentando login com:', username)
    
    const result = await login(username, password)
    
    if (result.success) {
      console.log('Login bem-sucedido!')
      router.push('/dashboard')
    } else {
      console.error('Login falhou:', result.error)
      alert(result.error || 'Erro ao fazer login')
    }
  }

  const handleForgotPassword = () => {
    alert('Funcionalidade de recuperação de senha será implementada em breve!')
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            InvestCase
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Faça login para acessar o sistema
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">Usuário</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-white border-gray-300 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border-gray-300 focus:border-blue-500"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:underline hover:text-blue-700 transition-colors"
            >
              Esqueceu sua senha?
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo:</strong> admin / admin123
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <AuthProviderWrapper>
      <LoginContent />
    </AuthProviderWrapper>
  )
}