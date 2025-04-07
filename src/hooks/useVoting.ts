import { useState, useEffect } from 'react'
import { GroupSession, RestaurantVote } from '../types'
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

  // Check for session ID in URL on initialization
  useEffect(() => {
    const loadSessionFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionId = urlParams.get('session')
      
      if (sessionId && (!session || session.id !== sessionId)) {
        console.log('Found session ID in URL:', sessionId)
        try {
          await loadSessionById(sessionId)
        } catch (err) {
          console.error('Error loading session from URL:', err)
        } finally {
          setSessionLoadAttempted(true)
        }
      } else {
        setSessionLoadAttempted(true)
      }
    }
    
    loadSessionFromUrl()
  }, [])

  // Create a new session
  const createSession = async (name: string = 'New Session') => {
    try {
      setIsLoading(true)
      console.log('Creating session with name:', name)
      const response = await fetch(`${API_BASE_URL}/sessions`, {
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
      console.log('Session created successfully:', data)
      setSession(data)
      
      // Update URL with session ID
      const url = new URL(window.location.href)
      url.searchParams.set('session', data.id)
      window.history.pushState({}, '', url)
      
      return data
    } catch (err) {
      setError('Failed to create session')
      console.error('Error creating session:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Load session by ID
  const loadSessionById = async (sessionId: string) => {
    if (!sessionId) {
      console.error('Cannot load session: No session ID provided')
      return null
    }
    
    if (session?.id === sessionId) {
      console.log('Session already loaded:', sessionId)
      return session
    }

    try {
      setIsLoading(true)
      console.log('Loading session with ID:', sessionId)
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`)
      if (!response.ok) {
        throw new Error('Failed to load session')
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
      setError('Failed to load session')
      console.error('Error loading session:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Get session URL
  const getSessionUrl = (): string => {
    if (!session) return ''
    const url = `${window.location.origin}?session=${session.id}`
    return url
  }

  // Get votes for a restaurant
  const getVotes = async (restaurantId: string): Promise<VoteCount> => {
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
      const upvotes = await getUpvotes(session?.id || '', restaurantId)
      const downvotes = await getDownvotes(session?.id || '', restaurantId)
      
      const voteCount = { 
        upvotes: upvotes.length, 
        downvotes: downvotes.length 
      }
      setVotesCache((prev: Record<string, VoteCount>) => ({ ...prev, [restaurantId]: voteCount }))
      
      return voteCount
    } catch (err) {
      console.error('Error getting votes:', err)
      return { upvotes: 0, downvotes: 0 }
    }
  }

  // Handle vote action
  const handleVote = async (restaurantId: string, isUpvote: boolean) => {
    if (!session) {
      console.error('Cannot vote without an active session')
      return
    }
    
    if (isUpvote) {
      await voteUp(restaurantId)
    } else {
      await voteDown(restaurantId)
    }
  }

  // Batch load votes for multiple restaurants
  const batchLoadVotes = async (restaurantIds: string[]): Promise<Record<string, VoteCount>> => {
    const uniqueIds = [...new Set(restaurantIds)]
    const newVotes: Record<string, VoteCount> = {}
    
    // First check session votes
    if (session && session.votes) {
      uniqueIds.forEach(id => {
        const sessionVote = session.votes.find((vote: RestaurantVote) => vote.restaurantId === id)
        if (sessionVote) {
          // Always treat upvotes and downvotes as arrays
          const upvotes = Array.isArray(sessionVote.upvotes) ? sessionVote.upvotes : []
          const downvotes = Array.isArray(sessionVote.downvotes) ? sessionVote.downvotes : []
          
          newVotes[id] = {
            upvotes: upvotes.length,
            downvotes: downvotes.length
          }
        }
      })
    }
    
    // Only load votes for restaurants not in cache or session
    const idsToLoad = uniqueIds.filter(id => !votesCache[id] && !newVotes[id])
    
    if (idsToLoad.length === 0) return { ...votesCache, ...newVotes }
    
    try {
      const upvotesPromises = idsToLoad.map(id => getUpvotes(session?.id || '', id))
      const downvotesPromises = idsToLoad.map(id => getDownvotes(session?.id || '', id))
      
      const upvotesResults = await Promise.all(upvotesPromises)
      const downvotesResults = await Promise.all(downvotesPromises)
      
      idsToLoad.forEach((id, index) => {
        newVotes[id] = {
          upvotes: upvotesResults[index].length,
          downvotes: downvotesResults[index].length
        }
      })
      
      setVotesCache((prev: Record<string, VoteCount>) => ({ ...prev, ...newVotes }))
      return { ...votesCache, ...newVotes }
    } catch (err) {
      console.error('Error batch loading votes:', err)
      return { ...votesCache, ...newVotes }
    }
  }

  // Modified getAllVotes to handle both single and batch requests
  const getAllVotes = async (restaurantIdOrIds: string | string[]): Promise<VoteResult> => {
    // If it's a single restaurant ID
    if (typeof restaurantIdOrIds === 'string') {
      return getVotes(restaurantIdOrIds)
    }
    
    // If it's an array of restaurant IDs
    return batchLoadVotes(restaurantIdOrIds)
  }

  // Vote up a restaurant
  const voteUp = async (restaurantId: string) => {
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
  }
  
  // Vote down a restaurant
  const voteDown = async (restaurantId: string) => {
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
  }

  return { 
    session, 
    error, 
    isLoading, 
    userId,
    getAllVotes, 
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