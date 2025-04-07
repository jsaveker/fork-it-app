import { useState, useEffect } from 'react'
import { GroupSession, RestaurantVote } from '../types'
import { Restaurant } from '../types/Restaurant'
import { getUpvotes, getDownvotes, upvoteRestaurant, downvoteRestaurant } from '../services/restaurantService'

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

  // Load session by ID
  const loadSessionById = async (sessionId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/sessions/${sessionId}`)
      if (!response.ok) {
        throw new Error('Failed to load session')
      }
      const data = await response.json()
      setSession(data.session)
      
      // Initialize votes cache from session data
      if (data.session && data.session.votes) {
        const initialVotes: Record<string, VoteCount> = {}
        data.session.votes.forEach((vote: RestaurantVote) => {
          initialVotes[vote.restaurantId] = {
            upvotes: vote.upvotes,
            downvotes: vote.downvotes
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
        return {
          upvotes: sessionVote.upvotes,
          downvotes: sessionVote.downvotes
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
  const handleVote = async (restaurantId: string, voteType: 'up' | 'down') => {
    if (!session) {
      console.error('Cannot vote without an active session')
      return
    }
    
    if (voteType === 'up') {
      await voteUp(restaurantId)
    } else if (voteType === 'down') {
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
          newVotes[id] = {
            upvotes: sessionVote.upvotes,
            downvotes: sessionVote.downvotes
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

  // Modified vote functions to update cache
  const voteUp = async (restaurantId: string) => {
    if (!session) {
      console.error('Cannot vote without an active session')
      return
    }
    
    try {
      setIsLoading(true)
      const result = await upvoteRestaurant(session.id, restaurantId)
      if (result) {
        setSession(result)
        
        // Update cache
        const currentVotes = votesCache[restaurantId] || { upvotes: 0, downvotes: 0 }
        setVotesCache(prev => ({
          ...prev,
          [restaurantId]: {
            upvotes: currentVotes.upvotes + 1,
            downvotes: currentVotes.downvotes
          }
        }))
      }
    } catch (err) {
      setError('Failed to upvote restaurant')
      console.error('Error upvoting:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const voteDown = async (restaurantId: string) => {
    if (!session) {
      console.error('Cannot vote without an active session')
      return
    }
    
    try {
      setIsLoading(true)
      const result = await downvoteRestaurant(session.id, restaurantId)
      if (result) {
        setSession(result)
        
        // Update cache
        const currentVotes = votesCache[restaurantId] || { upvotes: 0, downvotes: 0 }
        setVotesCache(prev => ({
          ...prev,
          [restaurantId]: {
            upvotes: currentVotes.upvotes,
            downvotes: currentVotes.downvotes + 1
          }
        }))
      }
    } catch (err) {
      setError('Failed to downvote restaurant')
      console.error('Error downvoting:', err)
    } finally {
      setIsLoading(false)
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
    handleVote
  }
} 