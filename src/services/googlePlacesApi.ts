import { Restaurant } from '../types/Restaurant';
import { Filters } from '../hooks/useFilters';

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.fork-it.cc';

interface SearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  filters: Filters;
}

export async function searchNearbyRestaurants(params: SearchParams): Promise<Restaurant[]> {
  const { latitude, longitude, radius, filters } = params;
  
  try {
    const response = await fetch(`${API_BASE_URL}/places/nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude,
        longitude,
        radius,
        filters
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch restaurants');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
} 