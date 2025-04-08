import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from '../hooks/useLocation';
import { Button, TextField, Box, CircularProgress } from '@mui/material';

declare global {
  interface Window {
    google: any;
  }
}

// Import environment variables from vite
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

export const AddressInput: React.FC = () => {
  const { setLocation, isLoading, error } = useLocation();
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (!GOOGLE_PLACES_API_KEY) {
      setApiError('Google Places API key is not configured');
      return;
    }

    // Load the Google Places API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = initializeAutocomplete;
    script.onerror = () => setApiError('Failed to load Google Places API');
    document.head.appendChild(script);

    return () => {
      // Clean up the script when component unmounts
      document.head.removeChild(script);
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) {
      setApiError('Failed to initialize Google Places API');
      return;
    }

    try {
      // Create the PlaceAutocompleteElement
      const autocomplete = new window.google.maps.places.PlaceAutocompleteElement({
        inputElement: inputRef.current,
        componentRestrictions: { country: 'us' },
      });

      // Store the autocomplete instance
      autocompleteRef.current = autocomplete;

      // Add event listener for place selection
      autocomplete.addEventListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          setAddress(place.formatted_address);
        }
      });
    } catch (err) {
      console.error('Error initializing autocomplete:', err);
      setApiError('Failed to initialize address autocomplete');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsSubmitting(true);
    setApiError(null);
    try {
      // Use the Google Geocoding API to get coordinates from the address
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({ address });
      
      if (result.results && result.results[0]) {
        const location = result.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        await setLocation({
          lat,
          lng,
          latitude: lat,
          longitude: lng,
          address: result.results[0].formatted_address,
        });
      } else {
        throw new Error('No results found for this address');
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
        inputRef={inputRef}
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