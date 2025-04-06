import { Restaurant, FilterOptions } from '../types'

declare global {
  interface Window {
    google: typeof google;
  }
}

export const searchNearbyRestaurants = async (
  latitude: number,
  longitude: number,
  filters: FilterOptions
): Promise<Restaurant[]> => {
  if (!window.google || !window.google.maps || !window.google.maps.places) {
    throw new Error('Google Maps Places API not loaded')
  }

  // Convert miles to meters for the Google API
  const radiusInMeters = filters.distance * 1609.34

  try {
    // Use the new Place API to search for nearby restaurants
    const response = await window.google.maps.places.Place.searchNearby({
      location: { lat: latitude, lng: longitude },
      radius: radiusInMeters,
      type: 'restaurant',
      keyword: filters.cuisineTypes.length > 0 ? filters.cuisineTypes.join(' ') : undefined,
    })

    if (response.status !== 'OK') {
      throw new Error(`Places API error: ${response.status}`)
    }

    // Filter and format the results
    return response.results
      .filter(place => {
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
      .map(place => ({
        id: place.place_id,
        name: place.name,
        vicinity: place.vicinity,
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        price_level: place.price_level || 0,
        geometry: {
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
        },
        types: place.types || [],
        photos: place.photos?.map(photo => ({
          height: photo.height,
          width: photo.width,
          html_attributions: photo.html_attributions,
          photo_reference: photo.photo_reference,
        })) || [],
      }))
  } catch (error) {
    console.error('Error searching for restaurants:', error)
    throw error
  }
} 