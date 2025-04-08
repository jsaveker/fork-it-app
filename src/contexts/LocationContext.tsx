import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { LocationData } from '../types';

export interface LocationContextType {
  location: LocationData | null;
  setLocation: (location: LocationData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refreshLocation: () => void;
}

export const LocationContext = createContext<LocationContextType | null>(null);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(() => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setIsLoading(false);
      },
      (error) => {
        let errorMessage = 'Unknown error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out';
            break;
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const setLocation = useCallback(async (newLocation: LocationData) => {
    setIsLoading(true);
    setError(null);
    try {
      setLocationState(newLocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set location');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Try to get location on mount
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        isLoading,
        error,
        refreshLocation: getLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}; 