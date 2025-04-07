import { useState, useEffect } from 'react'
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
import { useParams } from 'react-router-dom'

export default function GroupSession() {
  const { session, getSessionUrl, loadSessionById, isLoading } = useVotingContext()
  const [showCopied, setShowCopied] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const { sessionId } = useParams<{ sessionId: string }>()

  console.log('GroupSession component, session:', session?.id)

  useEffect(() => {
    const loadSession = async () => {
      if (sessionId) {
        setIsLoadingSession(true)
        try {
          await loadSessionById(sessionId)
        } catch (error) {
          console.error('Error loading session:', error)
        } finally {
          setIsLoadingSession(false)
        }
      }
    }
    loadSession()
  }, [sessionId, loadSessionById])

  if (isLoading || isLoadingSession) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    )
  }

  if (!session) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Alert severity="info">
          No active session. Start a new session or join an existing one to begin voting.
        </Alert>
      </Paper>
    )
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