import React, { useEffect, useState } from 'react'
import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import { useVoting } from '../hooks/useVoting'
import { Restaurant } from '../types/Restaurant'

interface VotingInterfaceProps {
  restaurant: Restaurant
}

interface VoteCount {
  upvotes: number
  downvotes: number
}

export const VotingInterface: React.FC<VotingInterfaceProps> = ({ restaurant }) => {
  const { handleVote, getVotes, session } = useVoting()
  const [votes, setVotes] = useState<VoteCount>({ upvotes: 0, downvotes: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadVotes = async () => {
      try {
        setLoading(true)
        const voteCount = await getVotes(restaurant.id)
        if (voteCount) {
          setVotes(voteCount)
        }
      } catch (error) {
        console.error('Error loading votes:', error)
      } finally {
        setLoading(false)
      }
    }
    loadVotes()
  }, [restaurant.id, getVotes])

  const handleUpvote = async () => {
    if (!session) {
      console.error('Cannot vote without an active session')
      return
    }
    
    try {
      setLoading(true)
      await handleVote(restaurant.id, 'up')
      const voteCount = await getVotes(restaurant.id)
      if (voteCount) {
        setVotes(voteCount)
      }
    } catch (error) {
      console.error('Error upvoting:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownvote = async () => {
    if (!session) {
      console.error('Cannot vote without an active session')
      return
    }
    
    try {
      setLoading(true)
      await handleVote(restaurant.id, 'down')
      const voteCount = await getVotes(restaurant.id)
      if (voteCount) {
        setVotes(voteCount)
      }
    } catch (error) {
      console.error('Error downvoting:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={session ? "Upvote" : "Join a session to vote"}>
        <span>
          <IconButton 
            onClick={handleUpvote} 
            color="primary" 
            disabled={!session || loading}
          >
            {loading ? <CircularProgress size={24} /> : <ThumbUpIcon />}
          </IconButton>
        </span>
      </Tooltip>
      <Typography>{votes.upvotes}</Typography>
      <Tooltip title={session ? "Downvote" : "Join a session to vote"}>
        <span>
          <IconButton 
            onClick={handleDownvote} 
            color="error" 
            disabled={!session || loading}
          >
            {loading ? <CircularProgress size={24} /> : <ThumbDownIcon />}
          </IconButton>
        </span>
      </Tooltip>
      <Typography>{votes.downvotes}</Typography>
    </Box>
  )
} 