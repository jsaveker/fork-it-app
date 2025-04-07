import { GroupSession } from '../types'

// Base URL for the API
const API_BASE_URL = 'https://api.fork-it.cc'

// Get upvotes for a restaurant
export const getUpvotes = async (restaurantId: string): Promise<number> => {
  try {
    // Since we don't have a direct endpoint for this, we'll return 0 for now
    // This should be updated when the API is properly implemented
    console.log('Getting upvotes for restaurant:', restaurantId)
    return 0
  } catch (err) {
    console.error('Error getting upvotes:', err)
    return 0
  }
}

// Get downvotes for a restaurant
export const getDownvotes = async (restaurantId: string): Promise<number> => {
  try {
    // Since we don't have a direct endpoint for this, we'll return 0 for now
    // This should be updated when the API is properly implemented
    console.log('Getting downvotes for restaurant:', restaurantId)
    return 0
  } catch (err) {
    console.error('Error getting downvotes:', err)
    return 0
  }
}

// Upvote a restaurant
export const upvoteRestaurant = async (sessionId: string, restaurantId: string): Promise<GroupSession | null> => {
  try {
    // Use the /vote endpoint instead
    const response = await fetch(`${API_BASE_URL}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        restaurantId,
        userId: 'anonymous', // We'll use a default user ID for now
        isUpvote: true
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to upvote restaurant')
    }
    const data = await response.json()
    return data
  } catch (err) {
    console.error('Error upvoting restaurant:', err)
    return null
  }
}

// Downvote a restaurant
export const downvoteRestaurant = async (sessionId: string, restaurantId: string): Promise<GroupSession | null> => {
  try {
    // Use the /vote endpoint instead
    const response = await fetch(`${API_BASE_URL}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        restaurantId,
        userId: 'anonymous', // We'll use a default user ID for now
        isUpvote: false
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to downvote restaurant')
    }
    const data = await response.json()
    return data
  } catch (err) {
    console.error('Error downvoting restaurant:', err)
    return null
  }
} 