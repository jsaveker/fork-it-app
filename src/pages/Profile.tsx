import { Box, Typography, Button } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user, logout } = useAuth()
  if (!user) return null
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Profile</Typography>
      <Typography>Email: {user.email}</Typography>
      <Button variant="outlined" sx={{ mt: 2 }} onClick={logout}>Logout</Button>
    </Box>
  )
}
