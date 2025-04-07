import { GroupSession, Restaurant } from '../types'

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.fork-it.cc'

/**
 * Create a new session
 */
export const createSession = async (name: string): Promise<GroupSession> => {
  console.log('Creating new session with name:', name)
  try {
    console.log('Sending request to:', `${API_BASE_URL}/sessions`)
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      console.error('Failed to create session:', response.status, response.statusText)
      throw new Error(`Failed to create session: ${response.status} ${response.statusText}`)
    }

    const session = await response.json()
    console.log('Session created successfully:', session.id)
    return session
  } catch (error) {
    console.error('Error creating session:', error)
    throw error
  }
}

/**
 * Get a session by ID
 */
export const getSession = async (sessionId: string): Promise<GroupSession | null> => {
  console.log('Getting session by ID:', sessionId)
  try {
    console.log('Sending request to:', `${API_BASE_URL}/sessions/${sessionId}`)
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.log('Session not found:', sessionId)
        return null
      }
      console.error('Failed to get session:', response.status, response.statusText)
      throw new Error(`Failed to get session: ${response.status} ${response.statusText}`)
    }

    const session = await response.json()
    console.log('Session retrieved successfully:', session.id)
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

/**
 * Update a session
 */
export const updateSession = async (session: GroupSession): Promise<GroupSession> => {
  console.log('Updating session:', session.id)
  try {
    console.log('Sending request to:', `${API_BASE_URL}/sessions/${session.id}`)
    const response = await fetch(`${API_BASE_URL}/sessions/${session.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    })

    if (!response.ok) {
      console.error('Failed to update session:', response.status, response.statusText)
      throw new Error(`Failed to update session: ${response.status} ${response.statusText}`)
    }

    const updatedSession = await response.json()
    console.log('Session updated successfully:', updatedSession.id)
    return updatedSession
  } catch (error) {
    console.error('Error updating session:', error)
    throw error
  }
}

/**
 * Vote on a restaurant
 */
export const vote = async (
  sessionId: string,
  restaurantId: string,
  userId: string,
  isUpvote: boolean
): Promise<GroupSession> => {
  console.log(`Voting ${isUpvote ? 'up' : 'down'} on restaurant:`, restaurantId, 'in session:', sessionId)
  try {
    console.log('Sending request to:', `${API_BASE_URL}/vote`)
    const response = await fetch(`${API_BASE_URL}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        restaurantId,
        userId,
        isUpvote,
      }),
    })

    if (!response.ok) {
      console.error('Failed to vote:', response.status, response.statusText)
      throw new Error(`Failed to vote: ${response.status} ${response.statusText}`)
    }

    const updatedSession = await response.json()
    console.log('Vote successful, session updated:', updatedSession.id)
    return updatedSession
  } catch (error) {
    console.error('Error voting:', error)
    throw error
  }
}

/**
 * Add a restaurant to a session
 */
export const addRestaurant = async (
  sessionId: string,
  restaurant: Restaurant
): Promise<GroupSession> => {
  console.log('Adding restaurant to session:', sessionId, 'restaurant:', restaurant.id)
  try {
    console.log('Sending request to:', `${API_BASE_URL}/add-restaurant`)
    const response = await fetch(`${API_BASE_URL}/add-restaurant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        restaurant,
      }),
    })

    if (!response.ok) {
      console.error('Failed to add restaurant:', response.status, response.statusText)
      throw new Error(`Failed to add restaurant: ${response.status} ${response.statusText}`)
    }

    const updatedSession = await response.json()
    console.log('Restaurant added successfully, session updated:', updatedSession.id)
    return updatedSession
  } catch (error) {
    console.error('Error adding restaurant:', error)
    throw error
  }
} 