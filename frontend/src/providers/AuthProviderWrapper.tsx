'use client'

import { ReactNode } from 'react'

interface AuthProviderWrapperProps {
  children: ReactNode
}

export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  return <>{children}</>
}