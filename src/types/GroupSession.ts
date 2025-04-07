import { Restaurant } from './Restaurant'

export interface RestaurantVote {
  restaurantId: string
  upvotes: number
  downvotes: number
}

export interface GroupSession {
  id: string
  name: string
  restaurants: Restaurant[]
  votes: RestaurantVote[]
  createdAt: string
  updatedAt: string
  expires: string
} 