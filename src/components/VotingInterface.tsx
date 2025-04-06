import {
  Box,
  IconButton,
  Badge,
} from '@mui/material'
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from '@mui/icons-material'
import { useVoting } from '../hooks/useVoting'
import { Restaurant } from '../types'

interface VotingInterfaceProps {
  restaurant: Restaurant
}

export default function VotingInterface({ restaurant }: VotingInterfaceProps) {
  const { userId, handleVote, getVotes, getAllVotes } = useVoting()
  const votes = getVotes(restaurant.id)
  const allVotes = getAllVotes(restaurant.id)

  const hasUpvoted = votes?.upvotes.includes(userId) || false
  const hasDownvoted = votes?.downvotes.includes(userId) || false

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          onClick={() => handleVote(restaurant.id, true)}
          color={hasUpvoted ? 'primary' : 'default'}
        >
          <Badge badgeContent={allVotes.upvotes} color="primary">
            <ThumbUpIcon />
          </Badge>
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          onClick={() => handleVote(restaurant.id, false)}
          color={hasDownvoted ? 'primary' : 'default'}
        >
          <Badge badgeContent={allVotes.downvotes} color="error">
            <ThumbDownIcon />
          </Badge>
        </IconButton>
      </Box>
    </Box>
  )
} 