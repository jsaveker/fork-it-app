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
    // Create a map element for the Places service
    const mapElement = document.createElement('div')
    const map = new window.google.maps.Map(mapElement, {
      center: { lat: latitude, lng: longitude },
      zoom: 15,
    })
    
    // Use the Places service
    const service = new window.google.maps.places.PlacesService(map)
    
    // Build the request with all filters
    const request: google.maps.places.PlaceSearchRequest = {
      location: new window.google.maps.LatLng(latitude, longitude),
      radius: radiusInMeters,
      type: 'restaurant',
    }

    // Add cuisine type filter if specified
    if (filters.cuisineTypes.length > 0) {
      // Join cuisine types with spaces for the keyword parameter
      request.keyword = filters.cuisineTypes.join(' ')
    }

    // Add price level filter if specified
    if (filters.priceLevel.length > 0) {
      request.minPriceLevel = Math.min(...filters.priceLevel)
      request.maxPriceLevel = Math.max(...filters.priceLevel)
    }

    // Convert callback-based API to Promise-based
    return new Promise((resolve, reject) => {
      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          // Filter results based on rating
          const filteredResults = results.filter(place => 
            (place.rating || 0) >= filters.rating
          )

          // Convert to our Restaurant type
          const restaurants: Restaurant[] = filteredResults.map(place => ({
            id: place.place_id || '',
            name: place.name || '',
            vicinity: place.vicinity || '',
            rating: place.rating || 0,
            user_ratings_total: place.user_ratings_total || 0,
            price_level: place.price_level || 0,
            geometry: {
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
            },
            types: place.types || [],
            photos: place.photos?.map(photo => ({
              height: photo.height,
              width: photo.width,
              html_attributions: photo.html_attributions,
              photo_reference: photo.getUrl(),
            })) || [],
          }))

          resolve(restaurants)
        } else {
          reject(new Error(`Places API error: ${status}`))
        }
      })
    })
  } catch (error) {
    console.error('Error searching for restaurants:', error)
    throw error
  }
} 