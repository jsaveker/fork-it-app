import { useState } from 'react'
import {
  Box,
  Typography,
  Snackbar,
  Paper,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  ContentCopy as CopyIcon,
  Share as ShareIcon,
} from '@mui/icons-material'
import { useVoting } from '../hooks/useVoting'

export default function GroupSession() {
  const { session } = useVoting()
  const [showCopied, setShowCopied] = useState(false)

  if (!session) {
    return null
  }

  // Create a URL with the session ID as a parameter
  const getSessionUrl = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('session', session.id)
    return url.toString()
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getSessionUrl())
    setShowCopied(true)
  }

  const handleShare = async () => {
    const url = getSessionUrl()
    
    // Check if the Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Fork-it Session',
          text: 'Join my restaurant voting session!',
          url: url,
        })
      } catch (error) {
        console.error('Error sharing:', error)
        // Fallback to copying to clipboard
        handleCopyLink()
      }
    } else {
      // Fallback to copying to clipboard
      handleCopyLink()
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Group Session
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Share this session with friends to vote together
      </Typography>
      
      <Box sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Session ID: <Typography component="span" variant="body2">{session.id}</Typography>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created: {new Date(session.createdAt).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Expires: {new Date(session.expires).toLocaleString()}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Copy Session Link">
          <IconButton 
            color="primary" 
            onClick={handleCopyLink}
          >
            <CopyIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Share Session">
          <IconButton 
            color="primary" 
            onClick={handleShare}
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        message="Session link copied to clipboard"
      />
    </Paper>
  )
} 