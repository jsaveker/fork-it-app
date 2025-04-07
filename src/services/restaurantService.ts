import { GroupSession } from '../types'

// Base URL for the API
const API_BASE_URL = 'https://api.fork-it.cc'

// Get upvotes for a restaurant
export const getUpvotes = async (restaurantId: string): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/upvotes`)
    if (!response.ok) {
      throw new Error('Failed to get upvotes')
    }
    const data = await response.json()
    return data.upvotes || 0
  } catch (err) {
    console.error('Error getting upvotes:', err)
    return 0
  }
}

// Get downvotes for a restaurant
export const getDownvotes = async (restaurantId: string): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/downvotes`)
    if (!response.ok) {
      throw new Error('Failed to get downvotes')
    }
    const data = await response.json()
    return data.downvotes || 0
  } catch (err) {
    console.error('Error getting downvotes:', err)
    return 0
  }
}

// Upvote a restaurant
export const upvoteRestaurant = async (sessionId: string, restaurantId: string): Promise<GroupSession | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/restaurants/${restaurantId}/upvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('Failed to upvote restaurant')
    }
    const data = await response.json()
    return data.session
  } catch (err) {
    console.error('Error upvoting restaurant:', err)
    return null
  }
}

// Downvote a restaurant
export const downvoteRestaurant = async (sessionId: string, restaurantId: string): Promise<GroupSession | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/restaurants/${restaurantId}/downvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('Failed to downvote restaurant')
    }
    const data = await response.json()
    return data.session
  } catch (err) {
    console.error('Error downvoting restaurant:', err)
    return null
  }
} 