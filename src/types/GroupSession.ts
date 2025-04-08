import { Restaurant } from './Restaurant'
import { Filters } from '../hooks/useFilters'

export interface RestaurantVote {
  restaurantId: string
  upvotes: string[]
  downvotes: string[]
}

export interface GroupSession {
  id: string
  name: string
  restaurants: Restaurant[]
  votes: RestaurantVote[]
  createdAt: string
  expires: number
  filters?: Filters
} 