import { useState, useEffect } from 'react'
import { GroupSession } from '../types'
import {
  createSession,
  getSession,
  vote,
  getVotesForRestaurant
} from '../services/votingService'

export const useVoting = () => {
  const [session, setSession] = useState<GroupSession | null>(null)
  const [userId] = useState<string>(() => {
    const storedId = localStorage.getItem('user_id')
    if (storedId) return storedId
    const newId = crypto.randomUUID()
    localStorage.setItem('user_id', newId)
    return newId
  })

  useEffect(() => {
    const loadedSession = getSession()
    if (!loadedSession) {
      const newSession = createSession('Default Session')
      setSession(newSession)
    } else {
      setSession(loadedSession)
    }
  }, [])

  const handleVote = (restaurantId: string, isUpvote: boolean) => {
    if (!session) return

    const updatedSession = vote(restaurantId, userId, isUpvote)
    setSession(updatedSession)
  }

  const getVotes = (restaurantId: string) => {
    return getVotesForRestaurant(restaurantId)
  }

  return {
    session,
    userId,
    handleVote,
    getVotes
  }
} 