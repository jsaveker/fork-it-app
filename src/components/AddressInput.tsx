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
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    // Load the Google Places API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeAutocomplete;
    document.head.appendChild(script);

    return () => {
      // Clean up the script when component unmounts
      document.head.removeChild(script);
    };
  }, []);

  const initializeAutocomplete = () => {
    if (inputRef.current && window.google) {
      // Create the PlaceAutocompleteElement
      const autocomplete = new window.google.maps.places.PlaceAutocompleteElement({
        inputElement: inputRef.current,
        componentRestrictions: { country: 'us' },
      });

      // Store the autocomplete instance
      autocompleteRef.current = autocomplete;

      // Add event listener for place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          setAddress(place.formatted_address);
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsSubmitting(true);
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
      }
    } catch (err) {
      console.error('Error geocoding address:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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