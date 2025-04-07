import { useState, useEffect } from 'react'
import { GroupSession } from '../types/GroupSession'
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
    const votes = await getAllVotes(restaurantId)
    return typeof votes === 'object' && !Array.isArray(votes) && 'upvotes' in votes
      ? votes as VoteCount
      : { upvotes: 0, downvotes: 0 }
  }

  // Handle vote action
  const handleVote = async (restaurantId: string, voteType: 'up' | 'down') => {
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
    
    // Only load votes for restaurants not in cache
    const idsToLoad = uniqueIds.filter(id => !votesCache[id])
    
    if (idsToLoad.length === 0) return votesCache
    
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
      return votesCache
    }
  }

  // Modified getAllVotes to handle both single and batch requests
  const getAllVotes = async (restaurantIdOrIds: string | string[]): Promise<VoteResult> => {
    // If it's a single restaurant ID
    if (typeof restaurantIdOrIds === 'string') {
      if (votesCache[restaurantIdOrIds]) {
        return votesCache[restaurantIdOrIds]
      }
      
      const votes = await batchLoadVotes([restaurantIdOrIds])
      return votes[restaurantIdOrIds] || { upvotes: 0, downvotes: 0 }
    }
    
    // If it's an array of restaurant IDs
    return batchLoadVotes(restaurantIdOrIds)
  }

  // Modified vote functions to update cache
  const voteUp = async (restaurantId: string) => {
    try {
      setIsLoading(true)
      const result = await upvoteRestaurant(session?.id || '', restaurantId)
      if (result) {
        setSession(result)
        // Update cache
        setVotesCache(prev => ({
          ...prev,
          [restaurantId]: {
            upvotes: (prev[restaurantId]?.upvotes || 0) + 1,
            downvotes: prev[restaurantId]?.downvotes || 0
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
    try {
      setIsLoading(true)
      const result = await downvoteRestaurant(session?.id || '', restaurantId)
      if (result) {
        setSession(result)
        // Update cache
        setVotesCache(prev => ({
          ...prev,
          [restaurantId]: {
            upvotes: prev[restaurantId]?.upvotes || 0,
            downvotes: (prev[restaurantId]?.downvotes || 0) + 1
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