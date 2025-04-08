import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material'
import { ThumbUp, ThumbDown } from '@mui/icons-material'
import { useVotingContext } from '../hooks/VotingProvider'
import { GroupSession } from '../types/GroupSession'

interface VotingInterfaceProps {
  restaurantId: string
  session: GroupSession | null
}

interface VoteCount {
  upvotes: number
  downvotes: number
}

export const VotingInterface = ({ restaurantId, session }: VotingInterfaceProps) => {
  const { getVotes, isLoading: sessionLoading } = useVotingContext()
  const [votes, setVotes] = useState<VoteCount>({ upvotes: 0, downvotes: 0 })
  const [votesLoaded, setVotesLoaded] = useState(false)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [userId] = useState(() => crypto.randomUUID())

  // Only log once per render
  useEffect(() => {
    if (!votesLoaded) {
      console.log('VotingInterface - Session state:', session?.id)
      console.log('VotingInterface - Restaurant:', restaurantId)
      console.log('VotingInterface - Session loading:', sessionLoading)
    }
  }, [session, restaurantId, sessionLoading, votesLoaded])

  // Memoize the loadVotes function to prevent unnecessary re-renders
  const loadVotes = useCallback(async () => {
    if (!session || votesLoaded) return
    
    try {
      console.log('Loading votes for restaurant:', restaurantId)
      const voteCount = await getVotes(restaurantId)
      console.log('Votes loaded for restaurant:', restaurantId, voteCount)
      setVotes(voteCount)
      setVotesLoaded(true)
    } catch (error) {
      console.error('Error loading votes:', error)
    }
  }, [restaurantId, getVotes, session, votesLoaded])

  // Load votes when restaurant or session changes, but only once
  useEffect(() => {
    if (session && !votesLoaded) {
      loadVotes()
    }
  }, [restaurantId, session, loadVotes, votesLoaded])

  useEffect(() => {
    if (session?.votes) {
      const vote = session.votes.find(v => v.restaurantId === restaurantId)
      if (vote) {
        setVotes({
          upvotes: vote.upvotes.length,
          downvotes: vote.downvotes.length
        })
        
        // Check if current user has voted
        if (vote.upvotes.includes(userId)) {
          setUserVote('up')
        } else if (vote.downvotes.includes(userId)) {
          setUserVote('down')
        } else {
          setUserVote(null)
        }
      }
    }
  }, [session, restaurantId, userId])

  const submitVote = async (voteType: 'up' | 'down') => {
    if (!session) {
      console.error('No active session')
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sessions/${session.id}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          userId,
          voteType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      // Update local state
      if (voteType === 'up') {
        if (userVote === 'up') {
          setVotes(prev => ({ ...prev, upvotes: prev.upvotes - 1 }))
          setUserVote(null)
        } else {
          if (userVote === 'down') {
            setVotes(prev => ({ ...prev, downvotes: prev.downvotes - 1 }))
          }
          setVotes(prev => ({ ...prev, upvotes: prev.upvotes + 1 }))
          setUserVote('up')
        }
      } else {
        if (userVote === 'down') {
          setVotes(prev => ({ ...prev, downvotes: prev.downvotes - 1 }))
          setUserVote(null)
        } else {
          if (userVote === 'up') {
            setVotes(prev => ({ ...prev, upvotes: prev.upvotes - 1 }))
          }
          setVotes(prev => ({ ...prev, downvotes: prev.downvotes + 1 }))
          setUserVote('down')
        }
      }
    } catch (err) {
      console.error('Error voting:', err)
    }
  }

  // Show loading state while session is being initialized
  if (sessionLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={24} />
        <Typography variant="body2">Initializing session...</Typography>
      </Box>
    )
  }

  if (!session) {
    return (
      <Typography variant="body2" color="text.secondary">
        Start or join a voting session to vote on restaurants
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        size="small"
        startIcon={<ThumbUp />}
        onClick={() => submitVote('up')}
        color={userVote === 'up' ? 'primary' : 'inherit'}
        variant={userVote === 'up' ? 'contained' : 'outlined'}
      >
        {votes.upvotes}
      </Button>
      <Button
        size="small"
        startIcon={<ThumbDown />}
        onClick={() => submitVote('down')}
        color={userVote === 'down' ? 'primary' : 'inherit'}
        variant={userVote === 'down' ? 'contained' : 'outlined'}
      >
        {votes.downvotes}
      </Button>
    </Box>
  )
} 