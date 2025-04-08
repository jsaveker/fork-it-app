import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { useVoting } from '../hooks/useVoting';
import { Button, TextField, Box, CircularProgress, Autocomplete } from '@mui/material';

interface Prediction {
  description: string;
  place_id: string;
}

export const AddressInput: React.FC = () => {
  const { setLocation, isLoading, error } = useLocation();
  const { session, createSession } = useVoting();
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const debounceTimer = useRef<number | null>(null);

  // Fetch autocomplete suggestions
  const fetchPredictions = async (input: string) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      return;
    }

    setIsLoadingPredictions(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/autocomplete?input=${encodeURIComponent(input)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setPredictions([]);
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  // Debounce the input to avoid too many API calls
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setAddress(value);
    
    // Clear previous timer
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = window.setTimeout(() => {
      fetchPredictions(value);
    }, 300);
  };

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
        // Create a session if one doesn't exist
        if (!session) {
          await createSession('New Session');
        }
        
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

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
    };
  }, []);

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
      <Autocomplete
        freeSolo
        options={predictions}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return option.description;
        }}
        loading={isLoadingPredictions}
        loadingText="Loading suggestions..."
        noOptionsText="No suggestions found"
        value={address}
        onChange={(_, newValue) => {
          if (typeof newValue === 'string') {
            setAddress(newValue);
          } else if (newValue) {
            setAddress(newValue.description);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Enter your address"
            variant="outlined"
            onChange={handleInputChange}
            error={!!error}
            helperText={error}
            disabled={isLoading || isSubmitting}
            sx={{ mb: 2 }}
          />
        )}
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