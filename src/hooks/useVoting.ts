import { useState, useEffect, useCallback } from 'react'
import { GroupSession, RestaurantVote, Restaurant } from '../types'
import { getUpvotes, getDownvotes, upvoteRestaurant, downvoteRestaurant } from '../services/restaurantService.js'

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.fork-it.cc'

export interface VoteCount {
  upvotes: number
  downvotes: number
}

export type VoteResult = VoteCount | Record<string, VoteCount>

export const useVoting = () => {
  const [session, setSession] = useState<GroupSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [votesCache, setVotesCache] = useState<Record<string, VoteCount>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [userId] = useState<string>(() => crypto.randomUUID())
  const [sessionLoadAttempted, setSessionLoadAttempted] = useState(false)
  const [sessionLoadInProgress, setSessionLoadInProgress] = useState(false)

  // Load session by ID
  const loadSessionById = useCallback(async (sessionId: string) => {
    if (!sessionId) {
      console.log('No session ID provided, skipping session load')
      setSessionLoadAttempted(true)
      return null
    }
    
    if (session?.id === sessionId) {
      console.log('Session already loaded:', sessionId)
      return session
    }

    if (sessionLoadInProgress) {
      console.log('Session load already in progress')
      return null
    }

    try {
      setIsLoading(true)
      setSessionLoadInProgress(true)
      console.log('Loading session with ID:', sessionId)
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`)
      
      if (response.status === 404) {
        console.log('Session not found:', sessionId)
        setError('Session not found')
        return null
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load session: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Session loaded successfully:', data)
      setSession(data)
      
      // Initialize votes cache from session data
      if (data && data.votes) {
        const initialVotes: Record<string, VoteCount> = {}
        data.votes.forEach((vote: RestaurantVote) => {
          // Handle both array and number formats for upvotes/downvotes
          const upvotesCount = Array.isArray(vote.upvotes) ? vote.upvotes.length : vote.upvotes || 0
          const downvotesCount = Array.isArray(vote.downvotes) ? vote.downvotes.length : vote.downvotes || 0
          
          initialVotes[vote.restaurantId] = {
            upvotes: upvotesCount,
            downvotes: downvotesCount
          }
        })
        setVotesCache(initialVotes)
      }
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session'
      setError(errorMessage)
      console.error('Error loading session:', err)
      return null
    } finally {
      setIsLoading(false)
      setSessionLoadInProgress(false)
      setSessionLoadAttempted(true)
    }
  }, [session, sessionLoadInProgress])

  // Check for session ID in URL on initialization
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
      
      if (sessionId && (!session || session.id !== sessionId)) {
        console.log('Found session ID in URL:', sessionId);
        try {
          await loadSessionById(sessionId);
        } catch (err) {
          console.error('Error loading session from URL:', err);
        }
      } else {
        setSessionLoadAttempted(true);
      }
    };
    
    loadSessionFromUrl();
  }, [loadSessionById]);

  // Create a new session
  const createSession = useCallback(async (name: string = 'New Session', restaurants: Restaurant[] = []) => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('Creating session with name:', name, 'and restaurants:', restaurants)
      const response = await fetch(`${API_BASE_URL}/sessions`, {
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
      console.log('Session created successfully:', data)
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

  // Get session URL
  const getSessionUrl = useCallback((): string => {
    if (!session) return ''
    
    // Create a URL with the session ID
    const url = new URL(window.location.origin + window.location.pathname)
    url.searchParams.set('session', session.id)
    
    // Preserve filter parameters from the current URL
    const currentParams = new URLSearchParams(window.location.search)
    const filterParams = ['price', 'distance', 'rating', 'openNow', 'sortBy']
    
    filterParams.forEach(param => {
      if (currentParams.has(param)) {
        url.searchParams.set(param, currentParams.get(param) || '')
      }
    })
    
    return url.toString()
  }, [session])

  // Get votes for a restaurant
  const getVotes = useCallback(async (restaurantId: string): Promise<VoteCount> => {
    if (!session?.id) {
      console.log('No active session, returning default vote count')
      return { upvotes: 0, downvotes: 0 }
    }

    // First check if we have the votes in the session
    if (session && session.votes) {
      const sessionVote = session.votes.find((vote: RestaurantVote) => vote.restaurantId === restaurantId)
      if (sessionVote) {
        // Always treat upvotes and downvotes as arrays
        const upvotes = Array.isArray(sessionVote.upvotes) ? sessionVote.upvotes : []
        const downvotes = Array.isArray(sessionVote.downvotes) ? sessionVote.downvotes : []
        
        return {
          upvotes: upvotes.length,
          downvotes: downvotes.length
        }
      }
    }
    
    // If not in session, check cache
    if (votesCache[restaurantId]) {
      return votesCache[restaurantId]
    }
    
    // If not in cache, fetch from API
    try {
      const upvotes = await getUpvotes(session.id, restaurantId)
      const downvotes = await getDownvotes(session.id, restaurantId)
      
      const voteCount = { 
        upvotes: upvotes.length, 
        downvotes: downvotes.length 
      }
      setVotesCache((prev: Record<string, VoteCount>) => ({ ...prev, [restaurantId]: voteCount }))
      
      return voteCount
    } catch (err) {
      console.error('Error fetching votes:', err)
      return { upvotes: 0, downvotes: 0 }
    }
  }, [session, votesCache])

  // Handle vote action
  const handleVote = useCallback(async (restaurantId: string, isUpvote: boolean) => {
    if (!session) {
      console.error('Cannot vote without an active session')
      return
    }
    
    if (isUpvote) {
      await voteUp(restaurantId)
    } else {
      await voteDown(restaurantId)
    }
  }, [session])

  // Vote up a restaurant
  const voteUp = useCallback(async (restaurantId: string) => {
    if (!session) {
      throw new Error('No active session')
    }
    
    try {
      await upvoteRestaurant(session.id, restaurantId, userId)
      
      // Update votes cache
      const currentVotes = votesCache[restaurantId] || { upvotes: 0, downvotes: 0 }
      const newVotes = {
        ...currentVotes,
        upvotes: currentVotes.upvotes + 1
      }
      
      setVotesCache((prev: Record<string, VoteCount>) => ({ ...prev, [restaurantId]: newVotes }))
      
      // Update session votes
      if (session.votes) {
        const voteIndex = session.votes.findIndex((v: RestaurantVote) => v.restaurantId === restaurantId)
        if (voteIndex >= 0) {
          const updatedVotes = [...session.votes]
          const currentVote = updatedVotes[voteIndex]
          const currentUpvotes = Array.isArray(currentVote.upvotes) ? currentVote.upvotes : []
          updatedVotes[voteIndex] = {
            ...currentVote,
            upvotes: [...currentUpvotes, userId]
          }
          setSession((prev: GroupSession | null) => prev ? { ...prev, votes: updatedVotes } : null)
        } else {
          const newVote: RestaurantVote = {
            restaurantId,
            upvotes: [userId],
            downvotes: []
          }
          setSession((prev: GroupSession | null) => prev ? {
            ...prev,
            votes: [...prev.votes, newVote]
          } : null)
        }
      }
    } catch (err) {
      console.error('Error voting up:', err)
      throw err
    }
  }, [session, userId, votesCache])
  
  // Vote down a restaurant
  const voteDown = useCallback(async (restaurantId: string) => {
    if (!session) {
      throw new Error('No active session')
    }
    
    try {
      await downvoteRestaurant(session.id, restaurantId, userId)
      
      // Update votes cache
      const currentVotes = votesCache[restaurantId] || { upvotes: 0, downvotes: 0 }
      const newVotes = {
        ...currentVotes,
        downvotes: currentVotes.downvotes + 1
      }
      
      setVotesCache((prev: Record<string, VoteCount>) => ({ ...prev, [restaurantId]: newVotes }))
      
      // Update session votes
      if (session.votes) {
        const voteIndex = session.votes.findIndex((v: RestaurantVote) => v.restaurantId === restaurantId)
        if (voteIndex >= 0) {
          const updatedVotes = [...session.votes]
          const currentVote = updatedVotes[voteIndex]
          const currentDownvotes = Array.isArray(currentVote.downvotes) ? currentVote.downvotes : []
          updatedVotes[voteIndex] = {
            ...currentVote,
            downvotes: [...currentDownvotes, userId]
          }
          setSession((prev: GroupSession | null) => prev ? { ...prev, votes: updatedVotes } : null)
        } else {
          const newVote: RestaurantVote = {
            restaurantId,
            upvotes: [],
            downvotes: [userId]
          }
          setSession((prev: GroupSession | null) => prev ? {
            ...prev,
            votes: [...prev.votes, newVote]
          } : null)
        }
      }
    } catch (err) {
      console.error('Error voting down:', err)
      throw err
    }
  }, [session, userId, votesCache])

  return { 
    session, 
    error, 
    isLoading, 
    userId,
    getAllVotes: getVotes, 
    voteUp, 
    voteDown,
    loadSessionById,
    setSession,
    getSessionUrl,
    getVotes,
    handleVote,
    createSession,
    sessionLoadAttempted
  }
} 