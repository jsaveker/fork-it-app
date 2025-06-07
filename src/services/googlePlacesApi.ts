import { Restaurant } from '../types/Restaurant';
import { Filters } from '../hooks/useFilters';
import { restaurants } from '../data/restaurants';

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface SearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  filters: Filters;
}

export async function searchNearbyRestaurants(params: SearchParams): Promise<Restaurant[]> {
  const { latitude, longitude, radius, filters } = params;

  const { minRating, maxPrice, minPrice } = filters;

  return restaurants.filter((r) => {
    const dist = distanceMeters(latitude, longitude, r.geometry.location.lat, r.geometry.location.lng);
    if (dist > radius) return false;
    if (minRating && r.rating < minRating) return false;
    if (minPrice && r.price_level < minPrice) return false;
    if (maxPrice && r.price_level > maxPrice) return false;
    return true;
  });
}
