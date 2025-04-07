import { Restaurant } from './Restaurant'

export interface Session {
  id: string
  restaurants: Restaurant[]
  createdAt: string
  updatedAt: string
} 