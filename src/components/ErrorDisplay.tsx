import { Box, Typography, Button } from '@mui/material'
import { motion } from 'framer-motion'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
        textAlign: 'center',
        px: 2,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 48,
            color: 'error.main',
            mb: 2,
          }}
        />
      </motion.div>
      
      <Typography
        variant="h6"
        color="error"
        sx={{ maxWidth: 400 }}
      >
        {message}
      </Typography>
      
      {onRetry && (
        <Button
          variant="contained"
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      )}
    </Box>
  )
}

export default ErrorDisplay 