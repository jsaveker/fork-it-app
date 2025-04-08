import React, { useState } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { Button, TextField, Box, CircularProgress } from '@mui/material';

export const AddressInput: React.FC = () => {
  const { setLocation, isLoading, error } = useLocation();
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsSubmitting(true);
    setApiError(null);
    try {
      // Use our secure proxy API for geocoding
      const response = await fetch(`${import.meta.env.VITE_API_URL}/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to geocode address');
      }
      
      const data = await response.json();
      if (data.latitude && data.longitude) {
        await setLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          address: data.formatted_address || address,
        });
      } else {
        throw new Error('Invalid geocoding response');
      }
    } catch (err) {
      console.error('Error geocoding address:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to geocode address');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (apiError) {
    return (
      <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <p className="text-red-500 mb-4">{apiError}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
      <TextField
        fullWidth
        label="Enter your address"
        variant="outlined"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        error={!!error}
        helperText={error}
        disabled={isLoading || isSubmitting}
        sx={{ mb: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!address || isLoading || isSubmitting}
      >
        {isLoading || isSubmitting ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Set Location'
        )}
      </Button>
    </Box>
  );
}; 