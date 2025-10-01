'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email === 'admin@invest.com' && password === 'admin123') {
        const userData: User = {
          id: '1',
          email: email,
          name: 'Administrador'
        }
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        
        return { success: true }
      } else {
        return { success: false, error: 'Email ou senha incorretos' }
      }
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/login')
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}