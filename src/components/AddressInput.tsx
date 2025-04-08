import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { Button, TextField, Box, CircularProgress } from '@mui/material';

declare global {
  interface Window {
    google: any;
  }
}

export const AddressInput: React.FC = () => {
  const { setLocation, isLoading, error } = useLocation();
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize Google Places Autocomplete
    const initAutocomplete = () => {
      if (!window.google || !inputRef.current) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
          setLocation({
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            accuracy: 0,
            address: place.formatted_address,
          });
        }
      });
    };

    // Load Google Places API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = initAutocomplete;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      document.head.removeChild(script);
    };
  }, [setLocation]);

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
        inputRef={inputRef}
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