import { Restaurant, FilterOptions } from '../types'

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
const GOOGLE_PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place'

export const searchNearbyRestaurants = async (
  latitude: number,
  longitude: number,
  filters: FilterOptions
): Promise<Restaurant[]> => {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error('Google Places API key is not configured')
  }

  // Convert miles to meters for the Google API
  const radiusInMeters = filters.distance * 1609.34

  // Build the query parameters
  const params = new URLSearchParams({
    location: `${latitude},${longitude}`,
    radius: radiusInMeters.toString(),
    type: 'restaurant',
    key: GOOGLE_PLACES_API_KEY,
  })

  // Add optional filters if they're set
  if (filters.rating > 0) {
    params.append('minprice', '0')
    params.append('maxprice', '4')
  }

  // Make the API request
  const response = await fetch(
    `${GOOGLE_PLACES_API_BASE_URL}/nearbysearch/json?${params.toString()}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch restaurants from Google Places API')
  }

  const data = await response.json()

  if (data.status !== 'OK') {
    throw new Error(`Google Places API error: ${data.status}`)
  }

  // Filter and format the results
  return data.results
    .filter((place: any) => {
      // Apply our custom filters
      if (filters.rating > 0 && (!place.rating || place.rating < filters.rating)) {
        return false
      }

      if (
        filters.priceLevel.length > 0 &&
        (!place.price_level || !filters.priceLevel.includes(place.price_level))
      ) {
        return false
      }

      if (filters.cuisineTypes.length > 0) {
        const placeTypes = place.types || []
        const hasMatchingCuisine = filters.cuisineTypes.some(cuisine =>
          placeTypes.includes(cuisine)
        )
        if (!hasMatchingCuisine) return false
      }

      return true
    })
    .map((place: any) => ({
      id: place.place_id,
      name: place.name,
      vicinity: place.vicinity,
      rating: place.rating || 0,
      user_ratings_total: place.user_ratings_total || 0,
      price_level: place.price_level || 0,
      geometry: place.geometry,
      types: place.types || [],
    }))
} 