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
  // Ensure Google Maps is loaded
  if (!window.google || !window.google.maps || !window.google.maps.places) {
    throw new Error('Google Maps JavaScript API not loaded')
  }

  const service = new window.google.maps.places.PlacesService(document.createElement('div'))
  
  const request: google.maps.places.PlaceSearchRequest = {
    location: new window.google.maps.LatLng(latitude, longitude),
    radius: filters.distance * 1609.34, // Convert miles to meters
    type: 'restaurant',
    keyword: filters.cuisineTypes.length > 0 ? filters.cuisineTypes.join(' ') : undefined,
    minPriceLevel: Math.min(...filters.priceLevel),
    maxPriceLevel: Math.max(...filters.priceLevel),
  }

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
} 