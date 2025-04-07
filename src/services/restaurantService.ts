import { Session } from '../types/Session'

// KV store keys
const UPVOTES_KEY_PREFIX = 'upvotes:'
const DOWNVOTES_KEY_PREFIX = 'downvotes:'
const SESSION_KEY_PREFIX = 'session:'

// Get upvotes for a restaurant
export const getUpvotes = async (restaurantId: string): Promise<number> => {
  try {
    const response = await fetch(`/api/votes/upvotes/${restaurantId}`)
    if (!response.ok) {
      throw new Error('Failed to get upvotes')
    }
    const data = await response.json()
    return data.count || 0
  } catch (error) {
    console.error('Error getting upvotes:', error)
    return 0
  }
}

// Get downvotes for a restaurant
export const getDownvotes = async (restaurantId: string): Promise<number> => {
  try {
    const response = await fetch(`/api/votes/downvotes/${restaurantId}`)
    if (!response.ok) {
      throw new Error('Failed to get downvotes')
    }
    const data = await response.json()
    return data.count || 0
  } catch (error) {
    console.error('Error getting downvotes:', error)
    return 0
  }
}

// Upvote a restaurant
export const upvoteRestaurant = async (sessionId: string, restaurantId: string): Promise<Session | null> => {
  try {
    const response = await fetch(`/api/votes/upvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, restaurantId }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to upvote restaurant')
    }
    
    const data = await response.json()
    return data.session
  } catch (error) {
    console.error('Error upvoting restaurant:', error)
    return null
  }
}

// Downvote a restaurant
export const downvoteRestaurant = async (sessionId: string, restaurantId: string): Promise<Session | null> => {
  try {
    const response = await fetch(`/api/votes/downvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, restaurantId }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to downvote restaurant')
    }
    
    const data = await response.json()
    return data.session
  } catch (error) {
    console.error('Error downvoting restaurant:', error)
    return null
  }
} 