import { useState, useEffect } from 'react'
import { GroupSession } from '../types'
import { createSession, getSession, vote as voteApi } from '../services/sessionApi'

export const useVoting = () => {
  // Initialize session from localStorage if available
  const [session, setSession] = useState<GroupSession | null>(() => {
    const storedSession = localStorage.getItem('current_session')
    if (storedSession) {
      try {
        return JSON.parse(storedSession)
      } catch (e) {
        console.error('Error parsing stored session:', e)
        return null
      }
    }
    return null
  })
  
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
    // Check if the session ID is already in the URL
    const urlParams = new URLSearchParams(window.location.search)
    const currentSessionId = urlParams.get('session')
    
    // Only update the URL if the session ID is different
    if (currentSessionId !== sessionId) {
      console.log('Updating URL with session ID:', sessionId)
      const url = new URL(window.location.href)
      url.searchParams.set('session', sessionId)
      window.history.replaceState({}, '', url.toString())
    } else {
      console.log('Session ID already in URL, not updating')
    }
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
        
        // If the server returned a different session ID, preserve the original one
        if (loadedSession.id !== sessionId) {
          console.log('Server returned different session ID, preserving original:', sessionId)
          // Create a new session object with the original ID but updated data
          const preservedSession = {
            ...loadedSession,
            id: sessionId
          }
          setSession(preservedSession)
          // Store in localStorage
          localStorage.setItem('current_session', JSON.stringify(preservedSession))
        } else {
          // If the session ID is the same, just update the session
          setSession(loadedSession)
          // Store in localStorage
          localStorage.setItem('current_session', JSON.stringify(loadedSession))
        }
        
        // Don't update the URL here - we want to keep the same session ID
      } else {
        console.log('Session not found, creating new one')
        const newSession = await createSession('Default Session')
        console.log('New session created:', newSession.id)
        setSession(newSession)
        // Store in localStorage
        localStorage.setItem('current_session', JSON.stringify(newSession))
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
      // Store in localStorage
      localStorage.setItem('current_session', JSON.stringify(newSession))
      updateUrlWithSessionId(newSession.id)
    } catch (err) {
      console.error('Error creating session:', err)
      setError('Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  // Load session from URL on mount
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
            
            // If the server returned a different session ID, preserve the original one
            if (loadedSession.id !== sessionId) {
              console.log('Server returned different session ID, preserving original:', sessionId)
              // Create a new session object with the original ID but updated data
              const preservedSession = {
                ...loadedSession,
                id: sessionId
              }
              setSession(preservedSession)
              // Store in localStorage
              localStorage.setItem('current_session', JSON.stringify(preservedSession))
            } else {
              // If the session ID is the same, just update the session
              setSession(loadedSession)
              // Store in localStorage
              localStorage.setItem('current_session', JSON.stringify(loadedSession))
            }
            
            // Don't update the URL here - we want to keep the same session ID
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

  // Update localStorage when session changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('current_session', JSON.stringify(session))
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
        // Store in localStorage
        localStorage.setItem('current_session', JSON.stringify(newSession))
        
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
        
        // IMPORTANT: Preserve the original session ID even if the server returns a different one
        if (updatedSession.id !== newSession.id) {
          console.log('Server returned different session ID, preserving original:', newSession.id)
          const preservedSession = {
            ...updatedSession,
            id: newSession.id
          }
          setSession(preservedSession)
          // Store in localStorage
          localStorage.setItem('current_session', JSON.stringify(preservedSession))
        } else {
          setSession(updatedSession)
          // Store in localStorage
          localStorage.setItem('current_session', JSON.stringify(updatedSession))
        }
        
        return
      }
      
      // Store the original session ID
      const originalSessionId = session.id
      console.log('Original session ID:', originalSessionId)
      
      // If we already have a session, just vote
      console.log(`Voting ${isUpvote ? 'up' : 'down'} on restaurant:`, restaurantId)
      console.log('Using session ID:', originalSessionId)
      const updatedSession = await voteApi(originalSessionId, restaurantId, userId, isUpvote)
      console.log('Vote successful, server returned session ID:', updatedSession.id)
      
      // Log the updated vote counts
      const updatedVote = updatedSession.votes.find(v => v.restaurantId === restaurantId)
      if (updatedVote) {
        console.log(`Updated votes for restaurant ${restaurantId}: ${updatedVote.upvotes.length} upvotes, ${updatedVote.downvotes.length} downvotes`)
      }
      
      // IMPORTANT: Preserve the original session ID even if the server returns a different one
      if (updatedSession.id !== originalSessionId) {
        console.log('Server returned different session ID, preserving original:', originalSessionId)
        // Create a new session object with the original ID but updated votes
        const preservedSession = {
          ...updatedSession,
          id: originalSessionId
        }
        setSession(preservedSession)
        // Store in localStorage
        localStorage.setItem('current_session', JSON.stringify(preservedSession))
      } else {
        // If the session ID is the same, just update the session
        setSession(updatedSession)
        // Store in localStorage
        localStorage.setItem('current_session', JSON.stringify(updatedSession))
      }
      
      // Don't update the URL here - we want to keep the same session ID
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