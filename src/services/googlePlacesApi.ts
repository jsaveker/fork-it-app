import { Restaurant } from '../types/Restaurant';

interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  filters?: {
    rating?: number;
    priceLevel?: number[];
    cuisineTypes?: string[];
  };
}

export async function searchNearbyRestaurants({
  latitude,
  longitude,
  radius,
  filters,
}: NearbySearchParams): Promise<Restaurant[]> {
  try {
    const response = await fetch('https://api.fork-it.cc/places/nearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude,
        longitude,
        radius,
        filters,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch restaurants');
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching for nearby restaurants:', error);
    throw error;
  }
} 