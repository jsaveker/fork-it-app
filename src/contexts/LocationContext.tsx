import React, { createContext, useState, useCallback } from 'react';
import { LocationData } from '../hooks/useLocation';

export interface LocationContextType {
  location: LocationData | null;
  setLocation: (location: LocationData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const LocationContext = createContext<LocationContextType | null>(null);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLocation = useCallback(async (newLocation: LocationData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Here you can add any additional logic for handling location updates
      // For example, saving to localStorage, making API calls, etc.
      setLocationState(newLocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set location');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        isLoading,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}; 