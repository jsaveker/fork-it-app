import React, { useEffect, useState } from 'react'
import {
  Box,
  IconButton,
  Typography,
} from '@mui/material'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import { useVoting, VoteCount } from '../hooks/useVoting'
import { Restaurant } from '../types/Restaurant'

interface VotingInterfaceProps {
  restaurant: Restaurant
}

export const VotingInterface: React.FC<VotingInterfaceProps> = ({ restaurant }) => {
  const { userId, handleVote, getVotes } = useVoting()
  const [votes, setVotes] = useState<VoteCount>({ upvotes: 0, downvotes: 0 })

  useEffect(() => {
    const loadVotes = async () => {
      const voteCount = await getVotes(restaurant.id)
      setVotes(voteCount)
    }
    loadVotes()
  }, [restaurant.id, getVotes])

  const handleUpvote = async () => {
    await handleVote(restaurant.id, 'up')
    const voteCount = await getVotes(restaurant.id)
    setVotes(voteCount)
  }

  const handleDownvote = async () => {
    await handleVote(restaurant.id, 'down')
    const voteCount = await getVotes(restaurant.id)
    setVotes(voteCount)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton onClick={handleUpvote} color="primary">
        <ThumbUpIcon />
      </IconButton>
      <Typography>{votes.upvotes}</Typography>
      <IconButton onClick={handleDownvote} color="error">
        <ThumbDownIcon />
      </IconButton>
      <Typography>{votes.downvotes}</Typography>
    </Box>
  )
} 