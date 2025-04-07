import React, { useEffect, useState, useCallback } from 'react'
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
import { useVotingContext } from '../hooks/VotingProvider'
import { Restaurant } from '../types/Restaurant'

interface VotingInterfaceProps {
  restaurant: Restaurant
}

interface VoteCount {
  upvotes: number
  downvotes: number
}

export const VotingInterface: React.FC<VotingInterfaceProps> = ({ restaurant }) => {
  const { handleVote, getVotes, session, isLoading: sessionLoading } = useVotingContext()
  const [votes, setVotes] = useState<VoteCount>({ upvotes: 0, downvotes: 0 })
  const [loading, setLoading] = useState(false)
  const [voteInProgress, setVoteInProgress] = useState(false)

  console.log('VotingInterface - Session state:', session)
  console.log('VotingInterface - Restaurant:', restaurant)
  console.log('VotingInterface - Session loading:', sessionLoading)

  // Memoize the loadVotes function to prevent unnecessary re-renders
  const loadVotes = useCallback(async () => {
    if (!session) return
    
    try {
      console.log('Loading votes for restaurant:', restaurant.id)
      const voteCount = await getVotes(restaurant.id)
      console.log('Votes loaded for restaurant:', restaurant.id, voteCount)
      setVotes(voteCount)
    } catch (error) {
      console.error('Error loading votes:', error)
    }
  }, [restaurant.id, getVotes, session])

  // Load votes when restaurant or session changes
  useEffect(() => {
    if (session) {
      loadVotes()
    }
  }, [restaurant.id, session, loadVotes])

  const handleUpvote = async () => {
    if (!session || voteInProgress) {
      console.error('Cannot vote without an active session or vote in progress')
      return
    }
    
    try {
      setVoteInProgress(true)
      await handleVote(restaurant.id, true)
      // Update votes directly instead of reloading
      setVotes(prev => ({ ...prev, upvotes: prev.upvotes + 1 }))
    } catch (error) {
      console.error('Error upvoting:', error)
    } finally {
      setVoteInProgress(false)
    }
  }

  const handleDownvote = async () => {
    if (!session || voteInProgress) {
      console.error('Cannot vote without an active session or vote in progress')
      return
    }
    
    try {
      setVoteInProgress(true)
      await handleVote(restaurant.id, false)
      // Update votes directly instead of reloading
      setVotes(prev => ({ ...prev, downvotes: prev.downvotes + 1 }))
    } catch (error) {
      console.error('Error downvoting:', error)
    } finally {
      setVoteInProgress(false)
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
                disabled={!session || voteInProgress}
              >
                {voteInProgress ? <CircularProgress size={24} /> : <ThumbUpIcon />}
              </IconButton>
            </span>
          </Tooltip>
          <Typography>{votes.upvotes}</Typography>
          <Tooltip title={session ? "Downvote" : "Join a session to vote"}>
            <span>
              <IconButton 
                onClick={handleDownvote} 
                color="error" 
                disabled={!session || voteInProgress}
              >
                {voteInProgress ? <CircularProgress size={24} /> : <ThumbDownIcon />}
              </IconButton>
            </span>
          </Tooltip>
          <Typography>{votes.downvotes}</Typography>
        </>
      )}
    </Box>
  )
} 