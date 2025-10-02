'use client'

import { useState } from 'react'

interface LoginResponse {
  access_token: string
  token_type: string
  username: string
  full_name: string
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // IMPORTANTE: OAuth2 exige formato x-www-form-urlencoded
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      console.log('🚀 Enviando requisição de login...')
      console.log('Username:', email)
      console.log('Tentando URL:', '/api/token')

      // Tentar primeiro com proxy Next.js
      let response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })

      // Se falhar, tentar direto no backend
      if (!response.ok && response.status === 404) {
        console.log('⚠️ Proxy falhou, tentando conexão direta...')
        response = await fetch('http://localhost:8000/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        })
      }

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('Login error:', error)
        return { 
          success: false, 
          error: error.detail || 'Credenciais inválidas' 
        }
      }

      const data: LoginResponse = await response.json()
      console.log('✅ Login bem-sucedido!', data)
      
      // Salvar token no localStorage
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('username', data.username)
      localStorage.setItem('full_name', data.full_name)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Erro ao conectar com o servidor' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('full_name')
    window.location.href = '/login'
  }

  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('token')
  }

  const getUser = () => {
    if (typeof window === 'undefined') return null
    return {
      username: localStorage.getItem('username'),
      full_name: localStorage.getItem('full_name'),
    }
  }

  return {
    login,
    logout,
    isLoading,
    isAuthenticated,
    getUser,
  }
}