export interface Restaurant {
  id: string
  name: string
  address: string
  rating: number
  priceLevel: number
  photoReference?: string
  placeId: string
  location: {
    lat: number
    lng: number
  }
} 