import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material'
import { useLocation } from '../hooks/useLocation'

interface ZipCodeInputProps {
  onSuccess?: () => void;
}

export const ZipCodeInput = ({ onSuccess }: ZipCodeInputProps) => {
  const [zipCode, setZipCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setLocationFromZipCode, error, loading } = useLocation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!zipCode || zipCode.length < 5) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await setLocationFromZipCode(zipCode)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error setting location from ZIP code:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Enter Your ZIP Code
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        We couldn't access your location. Please enter your ZIP code to find restaurants near you.
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="ZIP Code"
          variant="outlined"
          fullWidth
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
          placeholder="Enter your ZIP code"
          disabled={isSubmitting || loading}
          error={!!error}
          helperText={error || 'Enter your 5-digit ZIP code'}
          sx={{ mb: 2 }}
        />
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!zipCode || zipCode.length < 5 || isSubmitting || loading}
          startIcon={isSubmitting || loading ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting || loading ? 'Finding Location...' : 'Find Restaurants'}
        </Button>
      </Box>
    </Paper>
  )
} 