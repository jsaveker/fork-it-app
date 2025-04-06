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

  // Function to update the URL with the session ID
  const updateUrlWithSessionId = (sessionId: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('session', sessionId)
    window.history.replaceState({}, '', url.toString())
    console.log('Updated URL with session ID:', sessionId)
  }

  // Function to load a session by ID
  const loadSessionById = async (sessionId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Loading session by ID:', sessionId)
      const loadedSession = await getSession(sessionId)
      if (loadedSession) {
        console.log('Session loaded successfully:', loadedSession.id)
        setSession(loadedSession)
        // Make sure the URL is updated with the correct session ID
        updateUrlWithSessionId(loadedSession.id)
        return loadedSession
      } else {
        console.log('Session not found:', sessionId)
        setError('Session not found')
        return null
      }
    } catch (err) {
      console.error('Error loading session:', err)
      setError('Failed to load session')
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Check if there's a session ID in the URL
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session')
        
        console.log('Initial session ID from URL:', sessionId)
        
        let loadedSession: GroupSession | null = null
        
        if (sessionId) {
          // Try to load the session from the URL parameter
          console.log('Attempting to load session from URL:', sessionId)
          loadedSession = await getSession(sessionId)
        }
        
        if (!loadedSession) {
          // If no session ID in URL or session not found, create a new one
          console.log('Creating new session')
          loadedSession = await createSession('Default Session')
          // Update the URL with the new session ID
          updateUrlWithSessionId(loadedSession.id)
        }
        
        console.log('Setting session:', loadedSession.id)
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
      console.log(`Voting ${isUpvote ? 'up' : 'down'} on restaurant:`, restaurantId)
      const updatedSession = await voteApi(session.id, restaurantId, userId, isUpvote)
      console.log('Vote successful, updating session:', updatedSession.id)
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

  // Function to get all votes for a restaurant, regardless of user
  const getAllVotes = (restaurantId: string) => {
    if (!session) return { upvotes: 0, downvotes: 0 }
    
    const vote = session.votes.find(v => v.restaurantId === restaurantId)
    if (!vote) return { upvotes: 0, downvotes: 0 }
    
    return {
      upvotes: vote.upvotes.length,
      downvotes: vote.downvotes.length
    }
  }

  // Function to get the session URL for sharing
  const getSessionUrl = () => {
    if (!session) return ''
    
    // Create a new URL based on the current window location
    const url = new URL(window.location.origin + window.location.pathname)
    
    // Add the session ID as a query parameter
    url.searchParams.set('session', session.id)
    
    console.log('Generated session URL:', url.toString())
    return url.toString()
  }

  return {
    session,
    userId,
    handleVote,
    getVotes,
    getAllVotes,
    loadSessionById,
    loading,
    error,
    getSessionUrl
  }
} 