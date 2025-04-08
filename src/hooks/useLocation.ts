import { useContext } from 'react';
import { LocationContext, LocationContextType } from '../contexts/LocationContext';

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
} 