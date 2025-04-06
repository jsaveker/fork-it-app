import { useState, useEffect } from 'react'
import { GroupSession } from '../types'
import { createSession, getSession, vote as voteApi } from '../services/sessionApi'

export const useVoting = () => {
  const [session, setSession] = useState<GroupSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId] = useState<string>(() => {
    const storedId = localStorage.getItem('user_id')
    if (storedId) return storedId
    const newId = crypto.randomUUID()
    localStorage.setItem('user_id', newId)
    return newId
  })

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Check if there's a session ID in the URL
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session')
        
        let loadedSession: GroupSession | null = null
        
        if (sessionId) {
          // Try to load the session from the URL parameter
          loadedSession = await getSession(sessionId)
        }
        
        if (!loadedSession) {
          // If no session ID in URL or session not found, create a new one
          loadedSession = await createSession('Default Session')
        }
        
        setSession(loadedSession)
      } catch (err) {
        console.error('Error loading session:', err)
        setError('Failed to load session')
      } finally {
        setLoading(false)
      }
    }
    
    loadSession()
  }, [])

  const handleVote = async (restaurantId: string, isUpvote: boolean) => {
    if (!session) return
    
    try {
      const updatedSession = await voteApi(session.id, restaurantId, userId, isUpvote)
      setSession(updatedSession)
    } catch (err) {
      console.error('Error voting:', err)
      setError('Failed to vote')
    }
  }

  const getVotes = (restaurantId: string) => {
    if (!session) return null
    return session.votes.find(v => v.restaurantId === restaurantId) || null
  }

  return {
    session,
    userId,
    handleVote,
    getVotes,
    loading,
    error
  }
} 