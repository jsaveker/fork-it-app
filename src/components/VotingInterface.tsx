import React, { useEffect, useState } from 'react'
import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
  Alert,
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

  console.log('VotingInterface - Session state:', session)
  console.log('VotingInterface - Restaurant:', restaurant)

  useEffect(() => {
    const loadVotes = async () => {
      try {
        setLoading(true)
        console.log('Loading votes for restaurant:', restaurant.id)
        const voteCount = await getVotes(restaurant.id)
        console.log('Votes loaded for restaurant:', restaurant.id, voteCount)
        setVotes(voteCount)
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
      await handleVote(restaurant.id, true)
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
      await handleVote(restaurant.id, false)
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
      {!session && (
        <Alert severity="info" sx={{ flex: 1 }}>
          Start or join a voting session to vote on restaurants
        </Alert>
      )}
      
      {session && (
        <>
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
        </>
      )}
    </Box>
  )
} 