export interface Restaurant {
  id: string
  name: string
  vicinity: string
  rating: number
  user_ratings_total: number
  price_level: number
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  types: string[]
  address?: string
  priceLevel?: number
  placeId?: string
  location?: {
    lat: number
    lng: number
  }
} 