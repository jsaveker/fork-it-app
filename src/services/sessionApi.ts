import { GroupSession, Restaurant } from '../types'

// Base URL for the API
const API_BASE_URL = 'https://api.fork-it.cc'

/**
 * Create a new session
 */
export const createSession = async (name: string): Promise<GroupSession> => {
  console.log('Creating new session with name:', name)
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      console.error('Failed to create session:', response.status, response.statusText)
      throw new Error('Failed to create session')
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
      throw new Error('Failed to get session')
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
  const response = await fetch(`${API_BASE_URL}/sessions/${session.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(session),
  })

  if (!response.ok) {
    throw new Error('Failed to update session')
  }

  return response.json()
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
    throw new Error('Failed to vote')
  }

  return response.json()
}

/**
 * Add a restaurant to a session
 */
export const addRestaurant = async (
  sessionId: string,
  restaurant: Restaurant
): Promise<GroupSession> => {
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
    throw new Error('Failed to add restaurant')
  }

  return response.json()
} 