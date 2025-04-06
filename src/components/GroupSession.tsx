import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Snackbar,
} from '@mui/material'
import { useVoting } from '../hooks/useVoting'

export default function GroupSession() {
  const { session } = useVoting()
  const [showCopied, setShowCopied] = useState(false)

  if (!session) {
    return null
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Group Session
      </Typography>
      <Typography variant="body1">
        Session ID: {session.id}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Created: {new Date(session.createdAt).toLocaleString()}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Expires: {new Date(session.expires).toLocaleString()}
      </Typography>
      <Button
        variant="outlined"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href)
          setShowCopied(true)
        }}
        sx={{ mt: 2 }}
      >
        Copy Session Link
      </Button>
      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        message="Session link copied to clipboard"
      />
    </Box>
  )
} 