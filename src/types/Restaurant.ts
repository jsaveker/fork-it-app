export interface Restaurant {
  id: string
  name: string
  address: string
  vicinity: string
  rating: number
  user_ratings_total: number
  priceLevel: number
  price_level: number
  photoReference?: string
  placeId: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  types: string[]
  location: {
    lat: number
    lng: number
  }
} 