import { useState } from 'react'
import {
  Box,
  Typography,
  Snackbar,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  ContentCopy as CopyIcon,
  Share as ShareIcon,
} from '@mui/icons-material'
import { useVotingContext } from '../hooks/VotingProvider'
import { useParams, useLocation } from 'react-router-dom'

export default function GroupSession() {
  const { session, getSessionUrl, isLoading } = useVotingContext()
  const [showCopied, setShowCopied] = useState(false)
  const { sessionId: pathSessionId } = useParams<{ sessionId: string }>()
  const location = useLocation()
  
  // Get session ID from either path params or query params
  const getSessionId = () => {
    // Check path params first
    if (pathSessionId) {
      return pathSessionId
    }
    
    // Then check query params
    const urlParams = new URLSearchParams(location.search)
    const querySessionId = urlParams.get('session')
    return querySessionId
  }

  console.log('GroupSession component, session:', session?.id)
  console.log('Checking for session ID in URL:', getSessionId())
  console.log('Current session:', session)

  // Show loading state while loading session
  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    )
  }

  // Show message if no session and we have a session ID in the URL
  if (!session && getSessionId()) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Alert severity="info">
          Loading session...
        </Alert>
      </Paper>
    )
  }

  // Show message if no session and no session ID in the URL
  if (!session && !getSessionId()) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Alert severity="info">
          No active session. Start a new session or join an existing one to begin voting.
        </Alert>
      </Paper>
    )
  }

  // At this point, session should be defined
  if (!session) {
    return null; // This should never happen due to the checks above
  }

  const handleCopyLink = () => {
    const url = getSessionUrl()
    navigator.clipboard.writeText(url)
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
        autoHideDuration={3000}
        onClose={() => setShowCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowCopied(false)} severity="success">
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </Paper>
  )
} 