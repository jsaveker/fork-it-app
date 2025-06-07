import { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { loginWithGoogle, registerManual } = useAuth();
  const [name, setName] = useState('');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Welcome to Fork-it
      </Typography>
      <Button variant="contained" onClick={loginWithGoogle} sx={{ mb: 2 }}>
        Sign in with Google
      </Button>
      <Typography variant="body1">Or create account manually</Typography>
      <Box component="form" onSubmit={e => { e.preventDefault(); registerManual(name); }} sx={{ mt: 2 }}>
        <TextField label="Name" value={name} onChange={e => setName(e.target.value)} sx={{ mb: 1 }} fullWidth />
        <Button type="submit" variant="outlined" fullWidth>Create Account</Button>
      </Box>
    </Box>
  );
}
