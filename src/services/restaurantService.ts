import { GroupSession } from '../types'

// Get upvotes for a restaurant
export const getUpvotes = async (restaurantId: string): Promise<number> => {
  try {
    const response = await fetch(`/api/restaurants/${restaurantId}/upvotes`)
    if (!response.ok) {
      throw new Error('Failed to get upvotes')
    }
    const data = await response.json()
    return data.upvotes
  } catch (err) {
    console.error('Error getting upvotes:', err)
    return 0
  }
}

// Get downvotes for a restaurant
export const getDownvotes = async (restaurantId: string): Promise<number> => {
  try {
    const response = await fetch(`/api/restaurants/${restaurantId}/downvotes`)
    if (!response.ok) {
      throw new Error('Failed to get downvotes')
    }
    const data = await response.json()
    return data.downvotes
  } catch (err) {
    console.error('Error getting downvotes:', err)
    return 0
  }
}

// Upvote a restaurant
export const upvoteRestaurant = async (sessionId: string, restaurantId: string): Promise<GroupSession | null> => {
  try {
    const response = await fetch(`/api/sessions/${sessionId}/restaurants/${restaurantId}/upvote`, {
      method: 'POST',
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
    const response = await fetch(`/api/sessions/${sessionId}/restaurants/${restaurantId}/downvote`, {
      method: 'POST',
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