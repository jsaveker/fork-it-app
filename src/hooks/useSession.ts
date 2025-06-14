import { devLog } from '../utils/logger';
import { useState, useCallback, useEffect } from 'react'
import { GroupSession, Restaurant } from '../types'

export function useSession() {
  const [session, setSession] = useState<GroupSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null)

  // Load session from URL on mount
  useEffect(() => {
    const loadSessionFromUrl = async () => {
      // Check path params first
      const pathname = window.location.pathname;
      const pathMatch = pathname.match(/\/session\/([^\/]+)/);
      const pathSessionId = pathMatch ? pathMatch[1] : null;
      
      // Then check query params
      const urlParams = new URLSearchParams(window.location.search);
      const querySessionId = urlParams.get('session');
      
      // Use path param if available, otherwise use query param
      const sessionId = pathSessionId || querySessionId;
      
      if (sessionId) {
        devLog('Found session ID in URL:', sessionId);
        try {
          await loadSessionById(sessionId);
        } catch (err) {
          console.error('Error loading session from URL:', err);
          setError('Failed to load session from URL');
        }
      }
    };
    
    loadSessionFromUrl();
  }, []);

  const loadSessionById = useCallback(async (sessionId: string) => {
    if (!sessionId) {
      console.error('Cannot load session: No session ID provided')
      setError('No session ID provided')
      return null
    }
    
    if (session?.id === sessionId) {
      devLog('Session already loaded:', sessionId)
      return session
    }

    if (loadingSessionId === sessionId) {
      devLog('Session load already in progress')
      return null
    }

    try {
      setIsLoading(true)
      setError(null)
      setLoadingSessionId(sessionId)
      devLog('Loading session with ID:', sessionId)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sessions/${sessionId}`)
      
      if (response.status === 404) {
        setError('Session not found')
        return null
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load session: ${response.status}`)
      }
      
      const data = await response.json()
      devLog('Session loaded successfully:', data)
      setSession(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session'
      setError(errorMessage)
      console.error('Error loading session:', err)
      return null
    } finally {
      setIsLoading(false)
      setLoadingSessionId(null)
    }
  }, [session, loadingSessionId])

  const createSession = useCallback(async (name: string = 'New Session', restaurants: Restaurant[] = []) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name,
          restaurants,
          votes: []
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`)
      }

      const data = await response.json()
      devLog('Session created successfully:', data)
      setSession(data)
      
      // Update URL with session ID
      const url = new URL(window.location.href)
      url.searchParams.set('session', data.id)
      window.history.pushState({}, '', url)
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session'
      setError(errorMessage)
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

  // Prevent unnecessary session loading attempts
  const getSession = useCallback(async () => {
    if (!session) {
      devLog('No active session')
      return null
    }
    return session
  }, [session])

  return {
    session,
    isLoading,
    error,
    createSession,
    getSessionUrl,
    setSession,
    loadSessionById,
    getSession
  }
} 