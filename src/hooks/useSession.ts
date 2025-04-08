import { useState, useCallback } from 'react'
import { GroupSession } from '../types/GroupSession'

export function useSession() {
  const [session, setSession] = useState<GroupSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSession = useCallback(async (name: string = 'New Session') => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const data = await response.json()
      setSession(data)
      return data
    } catch (err) {
      setError('Failed to create session')
      console.error('Error creating session:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getSessionUrl = useCallback((): string => {
    if (!session) return ''
    
    const url = new URL(window.location.origin + window.location.pathname)
    url.searchParams.set('session', session.id)
    
    return url.toString()
  }, [session])

  return {
    session,
    isLoading,
    error,
    createSession,
    getSessionUrl,
    setSession
  }
} 