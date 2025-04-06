import { Restaurant, FilterOptions } from '../types'

// Mock implementation for development
export const searchNearbyRestaurants = async (
  latitude: number,
  longitude: number,
  filters: FilterOptions
): Promise<Restaurant[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Generate mock restaurants
  return generateMockRestaurants(latitude, longitude, filters)
}

const generateMockRestaurants = (
  latitude: number,
  longitude: number,
  filters: FilterOptions
): Restaurant[] => {
  const restaurants: Restaurant[] = []
  const count = Math.floor(Math.random() * 10) + 5 // 5-15 restaurants

  for (let i = 0; i < count; i++) {
    const lat = latitude + (Math.random() - 0.5) * 0.01
    const lng = longitude + (Math.random() - 0.5) * 0.01
    const rating = Math.random() * 4 + 1
    const priceLevel = Math.floor(Math.random() * 4) + 1
    const cuisineTypes = ['Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'American']
    const randomCuisine = cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)]

    // Apply filters
    if (rating < filters.rating) continue
    if (!filters.priceLevel.includes(priceLevel)) continue
    if (filters.cuisineTypes.length > 0 && !filters.cuisineTypes.includes(randomCuisine)) continue

    restaurants.push({
      id: `restaurant-${i}`,
      name: `${randomCuisine} Restaurant ${i + 1}`,
      vicinity: `${Math.floor(Math.random() * 1000)} Main St`,
      rating,
      user_ratings_total: Math.floor(Math.random() * 1000) + 100,
      price_level: priceLevel,
      geometry: {
        location: {
          lat,
          lng,
        },
      },
      types: [randomCuisine],
      photos: [],
    })
  }

  return restaurants
} 