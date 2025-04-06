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
        updateUrlWithSessionId(loadedSession.id)
      } else {
        console.log('Session not found, creating new one')
        const newSession = await createSession('Default Session')
        console.log('New session created:', newSession.id)
        setSession(newSession)
        updateUrlWithSessionId(newSession.id)
      }
    } catch (err) {
      console.error('Error loading session:', err)
      setError('Failed to load session')
    } finally {
      setLoading(false)
    }
  }

  // Create a new session
  const createNewSession = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Creating new session')
      const newSession = await createSession('Default Session')
      console.log('New session created:', newSession.id)
      setSession(newSession)
      updateUrlWithSessionId(newSession.id)
    } catch (err) {
      console.error('Error creating session:', err)
      setError('Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadSession = async () => {
      // Skip if we're already loading
      if (loading) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Check if there's a session ID in the URL
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session')
        
        console.log('Initial session ID from URL:', sessionId)
        
        if (sessionId) {
          // Try to load the session from the URL parameter
          console.log('Attempting to load session from URL:', sessionId)
          const loadedSession = await getSession(sessionId)
          
          if (loadedSession) {
            console.log('Successfully loaded session:', loadedSession.id)
            setSession(loadedSession)
            // Always update the URL to ensure it's consistent
            updateUrlWithSessionId(loadedSession.id)
          } else {
            console.log('Session not found, creating new one')
            await createNewSession()
          }
        } else {
          // If no session ID in URL, create a new one
          console.log('No session ID in URL, creating new session')
          await createNewSession()
        }
      } catch (err) {
        console.error('Error loading session:', err)
        setError('Failed to load session')
      } finally {
        setLoading(false)
      }
    }
    
    loadSession()
  }, []) // Only run this effect once on mount

  // Reset loading state if we have a session
  useEffect(() => {
    if (session) {
      setLoading(false)
    }
  }, [session])

  const handleVote = async (restaurantId: string, isUpvote: boolean) => {
    try {
      // If no session exists, create one first
      if (!session) {
        console.log('No session available, creating new one')
        const newSession = await createSession('Default Session')
        console.log('New session created:', newSession.id)
        
        // Update the session state
        setSession(newSession)
        
        // Update the URL with the new session ID
        updateUrlWithSessionId(newSession.id)
        
        // Now use the newly created session for voting
        console.log(`Voting ${isUpvote ? 'up' : 'down'} on restaurant:`, restaurantId)
        console.log('Using newly created session ID:', newSession.id)
        const updatedSession = await voteApi(newSession.id, restaurantId, userId, isUpvote)
        console.log('Vote successful, updating session:', updatedSession.id)
        
        // Log the updated vote counts
        const updatedVote = updatedSession.votes.find(v => v.restaurantId === restaurantId)
        if (updatedVote) {
          console.log(`Updated votes for restaurant ${restaurantId}: ${updatedVote.upvotes.length} upvotes, ${updatedVote.downvotes.length} downvotes`)
        }
        
        setSession(updatedSession)
        return
      }
      
      // If we already have a session, just vote
      console.log(`Voting ${isUpvote ? 'up' : 'down'} on restaurant:`, restaurantId)
      console.log('Using session ID:', session.id)
      const updatedSession = await voteApi(session.id, restaurantId, userId, isUpvote)
      console.log('Vote successful, updating session:', updatedSession.id)
      
      // Log the updated vote counts
      const updatedVote = updatedSession.votes.find(v => v.restaurantId === restaurantId)
      if (updatedVote) {
        console.log(`Updated votes for restaurant ${restaurantId}: ${updatedVote.upvotes.length} upvotes, ${updatedVote.downvotes.length} downvotes`)
      }
      
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
    if (!session) {
      console.log(`No session available for restaurant ${restaurantId}`)
      return { upvotes: 0, downvotes: 0 }
    }
    
    const vote = session.votes.find(v => v.restaurantId === restaurantId)
    if (!vote) {
      console.log(`No votes found for restaurant ${restaurantId}`)
      return { upvotes: 0, downvotes: 0 }
    }
    
    const upvotes = vote.upvotes.length
    const downvotes = vote.downvotes.length
    
    console.log(`Votes for restaurant ${restaurantId}: ${upvotes} upvotes, ${downvotes} downvotes`)
    
    return {
      upvotes,
      downvotes
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
    getSessionUrl,
    setSession
  }
} 