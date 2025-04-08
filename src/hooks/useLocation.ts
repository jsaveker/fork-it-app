import { useContext } from 'react';
import { LocationContext, LocationContextType, LocationProvider } from '../contexts/LocationContext';

export interface LocationData {
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  address?: string;
}

export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

export { LocationProvider }; 