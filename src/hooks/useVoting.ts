import { useState, useEffect } from 'react'
import { GroupSession, RestaurantVote } from '../types'
import { Restaurant } from '../types/Restaurant'
import { getUpvotes, getDownvotes, upvoteRestaurant, downvoteRestaurant } from '../services/restaurantService.js'

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
  const [userId] = useState<string | null>(null)

  // Create a new session
  const createSession = async (name: string = 'New Session') => {
    try {
      setIsLoading(true)
      const response = await fetch(`https://api.fork-it.cc/sessions`, {
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
    try {
      setIsLoading(true)
      const response = await fetch(`https://api.fork-it.cc/sessions/${sessionId}`)
      if (!response.ok) {
        throw new Error('Failed to load session')
      }
      const data = await response.json()
      setSession(data)
      
      // Initialize votes cache from session data
      if (data && data.votes) {
        const initialVotes: Record<string, VoteCount> = {}
        data.votes.forEach((vote: any) => {
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
    } catch (err) {
      setError('Failed to load session')
      console.error('Error loading session:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Get session URL
  const getSessionUrl = (): string => {
    if (!session) return ''
    return `${window.location.origin}?session=${session.id}`
  }

  // Get votes for a restaurant
  const getVotes = async (restaurantId: string): Promise<VoteCount> => {
    // First check if we have the votes in the session
    if (session && session.votes) {
      const sessionVote = session.votes.find(vote => vote.restaurantId === restaurantId)
      if (sessionVote) {
        // Handle both array and number formats for upvotes/downvotes
        const upvotesCount = Array.isArray(sessionVote.upvotes) ? sessionVote.upvotes.length : sessionVote.upvotes || 0
        const downvotesCount = Array.isArray(sessionVote.downvotes) ? sessionVote.downvotes.length : sessionVote.downvotes || 0
        
        return {
          upvotes: upvotesCount,
          downvotes: downvotesCount
        }
      }
    }
    
    // If not in session, check cache
    if (votesCache[restaurantId]) {
      return votesCache[restaurantId]
    }
    
    // If not in cache, fetch from API
    try {
      const upvotes = await getUpvotes(restaurantId)
      const downvotes = await getDownvotes(restaurantId)
      
      const voteCount = { upvotes, downvotes }
      setVotesCache(prev => ({ ...prev, [restaurantId]: voteCount }))
      
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
        const sessionVote = session.votes.find(vote => vote.restaurantId === id)
        if (sessionVote) {
          // Handle both array and number formats for upvotes/downvotes
          const upvotesCount = Array.isArray(sessionVote.upvotes) ? sessionVote.upvotes.length : sessionVote.upvotes || 0
          const downvotesCount = Array.isArray(sessionVote.downvotes) ? sessionVote.downvotes.length : sessionVote.downvotes || 0
          
          newVotes[id] = {
            upvotes: upvotesCount,
            downvotes: downvotesCount
          }
        }
      })
    }
    
    // Only load votes for restaurants not in cache or session
    const idsToLoad = uniqueIds.filter(id => !votesCache[id] && !newVotes[id])
    
    if (idsToLoad.length === 0) return { ...votesCache, ...newVotes }
    
    try {
      const upvotesPromises = idsToLoad.map(id => getUpvotes(id))
      const downvotesPromises = idsToLoad.map(id => getDownvotes(id))
      
      const upvotesResults = await Promise.all(upvotesPromises)
      const downvotesResults = await Promise.all(downvotesPromises)
      
      idsToLoad.forEach((id, index) => {
        newVotes[id] = {
          upvotes: upvotesResults[index],
          downvotes: downvotesResults[index]
        }
      })
      
      setVotesCache(prev => ({ ...prev, ...newVotes }))
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
      await upvoteRestaurant(restaurantId, session.id)
      
      // Update votes cache
      const currentVotes = votesCache[restaurantId] || { upvotes: 0, downvotes: 0 }
      const newVotes = {
        ...currentVotes,
        upvotes: currentVotes.upvotes + 1
      }
      
      setVotesCache(prev => ({ ...prev, [restaurantId]: newVotes }))
      
      // Update session votes
      if (session.votes) {
        const voteIndex = session.votes.findIndex(v => v.restaurantId === restaurantId)
        if (voteIndex >= 0) {
          const updatedVotes = [...session.votes]
          const currentVote = updatedVotes[voteIndex]
          updatedVotes[voteIndex] = {
            ...currentVote,
            upvotes: Array.isArray(currentVote.upvotes) 
              ? [...currentVote.upvotes, session.id]
              : 1
          }
          setSession(prev => prev ? { ...prev, votes: updatedVotes } : null)
        } else {
          const newVote: RestaurantVote = {
            restaurantId,
            upvotes: [session.id],
            downvotes: []
          }
          setSession(prev => prev ? {
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
      await downvoteRestaurant(restaurantId, session.id)
      
      // Update votes cache
      const currentVotes = votesCache[restaurantId] || { upvotes: 0, downvotes: 0 }
      const newVotes = {
        ...currentVotes,
        downvotes: currentVotes.downvotes + 1
      }
      
      setVotesCache(prev => ({ ...prev, [restaurantId]: newVotes }))
      
      // Update session votes
      if (session.votes) {
        const voteIndex = session.votes.findIndex(v => v.restaurantId === restaurantId)
        if (voteIndex >= 0) {
          const updatedVotes = [...session.votes]
          const currentVote = updatedVotes[voteIndex]
          updatedVotes[voteIndex] = {
            ...currentVote,
            downvotes: Array.isArray(currentVote.downvotes)
              ? [...currentVote.downvotes, session.id]
              : 1
          }
          setSession(prev => prev ? { ...prev, votes: updatedVotes } : null)
        } else {
          const newVote: RestaurantVote = {
            restaurantId,
            upvotes: [],
            downvotes: [session.id]
          }
          setSession(prev => prev ? {
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

  // Preload votes when session changes
  useEffect(() => {
    if (session?.restaurants) {
      const restaurantIds = session.restaurants.map((r: Restaurant) => r.id)
      batchLoadVotes(restaurantIds)
    }
  }, [session?.id])

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
    createSession
  }
} 