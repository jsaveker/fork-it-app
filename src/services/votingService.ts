import { Restaurant, RestaurantVote, GroupSession } from '../types'

// In a real app, this would be stored in a database
// For this demo, we'll use localStorage
const STORAGE_KEY = 'voting_session'

export const createSession = (name: string): GroupSession => {
  const session: GroupSession = {
    id: crypto.randomUUID(),
    name,
    restaurants: [],
    votes: [],
    createdAt: new Date().toISOString(),
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  return session
}

export const getSession = (): GroupSession | null => {
  const sessionData = localStorage.getItem(STORAGE_KEY)
  if (!sessionData) return null
  return JSON.parse(sessionData)
}

export const saveSession = (session: GroupSession): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export const vote = (
  restaurantId: string,
  userId: string,
  isUpvote: boolean
): GroupSession => {
  let session = getSession()
  if (!session) {
    session = createSession('Default Session')
  }

  // Find the vote for this restaurant
  let restaurantVote = session.votes.find(v => v.restaurantId === restaurantId)

  // If no vote exists for this restaurant, create one
  if (!restaurantVote) {
    restaurantVote = {
      restaurantId,
      upvotes: [],
      downvotes: []
    }
    session.votes.push(restaurantVote)
  }

  // Remove any existing votes by this user for this restaurant
  restaurantVote.upvotes = restaurantVote.upvotes.filter(id => id !== userId)
  restaurantVote.downvotes = restaurantVote.downvotes.filter(id => id !== userId)

  // Add the new vote
  if (isUpvote) {
    restaurantVote.upvotes.push(userId)
  } else {
    restaurantVote.downvotes.push(userId)
  }

  saveSession(session)
  return session
}

export const getVotesForRestaurant = (
  restaurantId: string
): RestaurantVote | null => {
  const session = getSession()
  if (!session) return null
  return session.votes.find(v => v.restaurantId === restaurantId) || null
}

export const addRestaurant = (restaurant: Restaurant): void => {
  let session = getSession()
  if (!session) {
    session = createSession('Default Session')
  }
  
  if (!session.restaurants.some(r => r.id === restaurant.id)) {
    session.restaurants.push(restaurant)
    saveSession(session)
  }
}

export const getRestaurantVotes = (
  restaurantId: string
): RestaurantVote | null => {
  const session = getSession()
  if (!session) return null
  return session.votes.find(v => v.restaurantId === restaurantId) || null
}

export const getUserVote = (
  restaurantId: string,
  userId: string
): boolean | null => {
  const votes = getRestaurantVotes(restaurantId)
  if (!votes) return null
  
  if (votes.upvotes.includes(userId)) return true
  if (votes.downvotes.includes(userId)) return false
  return null
} 